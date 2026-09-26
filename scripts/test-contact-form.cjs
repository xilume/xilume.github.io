// Run with Node.js 24: node scripts/test-contact-form.cjs
// Offline behavior tests: execute the full contact script with a minimal DOM and
// network tripwires and native-submit events. These do not prove browser rendering or email delivery.
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'contact/contact.js'), 'utf8');
const tests = [];
const test = (name, run) => tests.push({ name, run });

function attributes(text) {
  const result = new Map();
  for (const [, name, value] of text.matchAll(/([\w-]+)="([^"]*)"/g)) result.set(name, value);
  return result;
}

class Element {
  constructor(text = '') {
    this.attributes = new Map();
    this.listeners = new Map();
    this.dataset = {};
    this.children = [];
    this._text = text;
    this.hidden = false;
    this.disabled = false;
  }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this._text = String(value); this.children = []; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  emit(type, event = {}) { return Promise.all((this.listeners.get(type) ?? []).map(callback => callback(event))); }
  querySelector(selector) {
    return this.children.find(child => child.selector === selector) ?? null;
  }
}

class Field extends Element {
  constructor(markup) {
    super();
    this.attributes = attributes(markup);
    this.name = this.getAttribute('name');
    this.type = this.getAttribute('type') ?? 'text';
    this.required = /\srequired(?:\s|>|=)/.test(markup);
    this.defaultValue = this.getAttribute('value') ?? '';
    this.value = this.defaultValue;
    this.validationMessage = '';
  }
  setCustomValidity(message) { this.validationMessage = message; }
  // Only the constraints exercised here are modeled. Real browser validation is
  // checked separately; this is not intended as an HTML constraint implementation.
  checkValidity() {
    return !this.validationMessage && (!this.required || this.value !== '') &&
      (this.type !== 'email' || this.value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value));
  }
}

function page(language = 'en', fetchImplementation = async () => response({ success: true }), features = {}) {
  const relative = language === 'en' ? 'contact/index.html' : 'zh-cn/contact/index.html';
  const html = fs.readFileSync(path.join(root, relative), 'utf8');
  const formMarkup = html.match(/<form\b[^>]*data-contact-form[^>]*>([\s\S]*?)<\/form>/);
  assert.ok(formMarkup, `${relative}: real contact form exists`);
  const form = new Element();
  form.attributes = attributes(formMarkup[0].slice(0, formMarkup[0].indexOf('>')));
  const fields = {};
  for (const [markup] of formMarkup[1].matchAll(/<(?:input|textarea)\b[^>]*>/g)) {
    const field = new Field(markup);
    if (!field.name) continue;
    if (field.type === 'radio') {
      if (/\schecked(?:\s|>|=)/.test(markup)) fields[field.name] = field;
    } else fields[field.name] = field;
  }
  const labelMarkup = html.match(/<span\b[^>]*data-contact-submit-label[^>]*>([^<]*)<\/span>/);
  assert.ok(labelMarkup, `${relative}: dedicated submit label exists`);
  const label = new Element(labelMarkup[1]);
  label.selector = '[data-contact-submit-label]';
  const icon = new Element();
  icon.selector = 'svg';
  const button = new Element();
  button.selector = '[data-contact-submit]';
  button.children = [label, icon];
  const status = new Element();
  status.selector = '[data-contact-status]';
  form.children = [button, status];
  form.elements = { namedItem(name) { return fields[name] ?? null; } };
  form.querySelector = selector => selector === '[data-contact-submit-label]' ? button.querySelector(selector) : form.children.find(child => child.selector === selector) ?? null;
  form.reportValidity = () => Object.values(fields).every(field => field.checkValidity());
  form.resetCount = 0;
  form.reset = () => {
    form.resetCount++;
    for (const field of Object.values(fields)) field.value = field.defaultValue;
  };
  const requests = [];
  const timers = new Map();
  let nextTimer = 0;
  const window = {
    // A synthetic visitor URL catches accidental forwarding of query/hash data.
    location: new URL('https://xilume.co/contact/?private=visitor-only@example.invalid&token=DO_NOT_FORWARD#private-fragment'),
    AbortController: features.abort === false ? undefined : AbortController,
    fetch: features.fetch === false ? undefined : (url, options) => {
      requests.push({ url, options });
      return fetchImplementation(url, options);
    },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  };
  const document = {
    documentElement: { lang: html.match(/<html\b[^>]*lang="([^"]+)"/)[1] },
    querySelector: selector => selector === '[data-contact-form]' ? form : null
  };
  // No host fetch or filesystem APIs are exposed to the tested script.
  vm.runInNewContext(source, { window, document, AbortController: window.AbortController }, { filename: 'contact/contact.js' });
  const idleLabel = label.textContent;
  return {
    form, fields, button, label, icon, status, requests, timers, idleLabel,
    fill(values = {}) {
      const defaults = { email: 'visitor@example.com', name: 'Sample Visitor', message: 'What is the price for 10 units of Octant?' };
      for (const [name, value] of Object.entries({ ...defaults, ...values })) fields[name].value = value;
    },
    submit() {
      const event = { prevented: false, preventDefault() { this.prevented = true; } };
      const settled = form.emit('submit', event);
      return { event, settled };
    },
    expectRestored() {
      assert.equal(button.disabled, false, 'submit button recovers');
      assert.equal(form.getAttribute('aria-busy'), null, 'busy state is cleared');
      assert.equal(label.textContent, idleLabel, 'button label recovers');
      assert.equal(button.querySelector('svg'), icon, 'submit icon survives state changes');
      assert.equal(timers.size, 0, 'request timeout is cleared');
    },
    expectPreserved(values) {
      for (const [name, value] of Object.entries(values)) assert.equal(fields[name].value, value, `${name} remains available`);
      assert.equal(form.resetCount, 0, 'form was not reset');
    }
  };
}

function response(result, ok = true) { return { ok, json: async () => result }; }
for (const language of ['en', 'zh-CN']) {
  test(`${language}: autoresponse uses native POST with reCAPTCHA and visitor email`, async () => {
    const p = page(language);
    assert.equal(p.form.getAttribute('method').toLowerCase(), 'post');
    assert.equal(p.form.getAttribute('action'), 'https://formsubmit.co/contact@xilume.co');
    assert.equal(p.fields._captcha.value, 'true');
    assert.equal(p.fields.language.value, language);
    assert.match(p.fields._autoresponse.value, /Thank you for contacting Xilume/);
    assert.match(p.fields._autoresponse.value, /Your message has been received/);
    assert.match(p.fields._autoresponse.value, /This is an automated confirmation email/);
    assert.equal(p.fields.email.required, true);
    assert.equal(p.fields.message.required, true);
    assert.equal(p.fields.name.required, false);
    p.fill({ name: '' });
    const submission = p.submit();
    await submission.settled;
    assert.equal(submission.event.prevented, false, 'valid submission navigates natively');
    assert.equal(p.requests.length, 0, 'AJAX would suppress the autoresponse');
    assert.notEqual(p.status.dataset.state, 'success', 'navigation does not prove delivery');
    p.expectPreserved({ email: 'visitor@example.com', name: '' });
    p.expectRestored();
  });

  test(`${language}: invalid input blocks submission and recovers after editing`, async () => {
    const p = page(language);
    for (const invalid of [{ email: '' }, { message: '' }, { email: '   ' }, { message: '   ' }, { email: 'not-an-email' }]) {
      p.fill(invalid);
      await p.fields.email.emit('input');
      await p.fields.message.emit('input');
      const submission = p.submit();
      await submission.settled;
      assert.equal(submission.event.prevented, true);
      assert.equal(p.form.resetCount, 0);
    }
    p.fill({ email: ' visitor@example.com ', name: ' Sample Visitor ', message: ' A price question ' });
    await p.fields.email.emit('input');
    await p.fields.message.emit('input');
    const submission = p.submit();
    await submission.settled;
    assert.equal(submission.event.prevented, false);
    p.expectPreserved({ email: 'visitor@example.com', name: 'Sample Visitor', message: 'A price question' });
  });

  test(`${language}: honeypot blocks native submission without claiming success`, async () => {
    const p = page(language);
    p.fill({ _honey: 'https://spam.example.invalid' });
    const submission = p.submit();
    await submission.settled;
    assert.equal(submission.event.prevented, true);
    assert.equal(p.status.dataset.state, 'error');
    assert.equal(p.requests.length, 0);
    p.expectPreserved({ email: 'visitor@example.com' });
  });

  test(`${language}: no fetch or AbortController required, fixed public source`, async () => {
    const p = page(language, undefined, { fetch: false, abort: false });
    p.fill();
    const submission = p.submit();
    await submission.settled;
    assert.equal(submission.event.prevented, false);
    assert.equal(p.fields._url.value, language === 'en' ? 'https://xilume.co/contact/' : 'https://xilume.co/zh-cn/contact/');
    assert.doesNotMatch(JSON.stringify(Object.fromEntries(Object.entries(p.fields).map(([key, field]) => [key, field.value]))), /visitor-only|DO_NOT_FORWARD|private-fragment/);
  });
}

(async () => {
  for (const { name, run } of tests) {
    await run();
    console.log(`PASS ${name}`);
  }
  console.log(`Passed ${tests.length} contact form scenarios (offline; no email sent).`);
})().catch(error => { console.error(error); process.exitCode = 1; });
