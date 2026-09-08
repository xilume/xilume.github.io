// Run with Node.js 24: node scripts/test-contact-form.cjs
// Offline behavior tests: execute the full contact script with a minimal DOM and
// mocked fetch/timers. These do not prove browser rendering or email delivery.
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
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

for (const language of ['en', 'zh-CN']) {
  test(`${language}: HTML requirements, whitespace and invalid email block network requests`, async () => {
    const p = page(language);
    assert.equal(p.form.getAttribute('method').toLowerCase(), 'post');
    assert.equal(p.form.getAttribute('action'), 'https://formsubmit.co/contact@xilume.co');
    assert.equal(p.fields.email.required, true);
    assert.equal(p.fields.message.required, true);
    assert.equal(p.fields.name.required, false, 'name stays optional');
    for (const invalid of [{ email: '' }, { message: '' }, { email: ' \t\n ' }, { message: ' \t\n ' }, { email: 'not-an-email' }]) {
      p.fill(invalid);
      await p.fields.email.emit('input');
      await p.fields.message.emit('input');
      await p.submit().settled;
      assert.equal(p.requests.length, 0);
    }
    p.fill();
    await p.fields.email.emit('input');
    await p.fields.message.emit('input');
    assert.equal(p.fields.email.validationMessage, '', 'editing clears custom validation');
    assert.equal(p.fields.message.validationMessage, '');
    await p.submit().settled;
    assert.equal(p.requests.length, 1, 'corrected fields can be submitted');
    p.expectRestored();
  });

  for (const acknowledged of [true, 'true']) {
    test(`${language}: ${JSON.stringify(acknowledged)} acknowledgement clears unchanged form`, async () => {
      const p = page(language, async () => response({ success: acknowledged }));
      p.fill({ email: ' visitor@example.com ', name: ' 测试 Visitor ', message: ' A price question ' });
      const submission = p.submit();
      assert.equal(submission.event.prevented, true);
      assert.equal(p.button.disabled, true);
      assert.equal(p.form.getAttribute('aria-busy'), 'true');
      assert.equal(p.status.dataset.state, 'sending');
      assert.match(p.label.textContent, language === 'en' ? /Sending/ : /正在发送/);
      await submission.settled;
      assert.equal(p.status.dataset.state, 'success');
      assert.match(p.status.textContent, language === 'en' ? /one business day/ : /一个工作日/);
      assert.equal(p.status.hidden, false);
      assert.equal(p.fields.email.value, '');
      assert.equal(p.fields.name.value, '');
      assert.equal(p.fields.message.value, '');
      assert.equal(p.form.resetCount, 1);
      p.expectRestored();
    });
  }

  test(`${language}: payload has only intended fields and no visitor URL or credentials`, async () => {
    const p = page(language);
    p.fill({ name: '', topic: 'selection' });
    await p.submit().settled;
    const { url, options } = p.requests[0];
    assert.equal(url, 'https://formsubmit.co/ajax/contact@xilume.co');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(options.signal instanceof AbortSignal, true);
    const payload = JSON.parse(options.body);
    assert.deepEqual(Object.keys(payload).sort(), ['email', 'name', 'message', 'topic', 'language', '_subject', '_url', '_template', '_honey'].sort());
    assert.equal(payload._url, language === 'en' ? 'https://xilume.co/contact/' : 'https://xilume.co/zh-cn/contact/');
    assert.equal(payload.language, language);
    assert.equal(payload.topic, 'selection');
    assert.equal(payload.name, '', 'optional name does not prevent sending');
    assert.equal(payload._honey, '');
    assert.doesNotMatch(options.body, /visitor-only|DO_NOT_FORWARD|private-fragment|[?]private=/);
    assert.equal(Object.keys(options.headers).some(key => /authorization|cookie/i.test(key)), false);
    p.expectRestored();
  });

  test(`${language}: honeypot blocks submission without claiming success`, async () => {
    const p = page(language);
    p.fill({ _honey: 'https://spam.example.invalid' });
    await p.submit().settled;
    assert.equal(p.requests.length, 0);
    assert.equal(p.status.dataset.state, 'error');
    p.expectPreserved({ email: 'visitor@example.com', message: 'What is the price for 10 units of Octant?' });
    p.expectRestored();
  });

  for (const rejected of [false, 'false', undefined]) {
    test(`${language}: ${String(rejected)} success value is not acknowledged`, async () => {
      const p = page(language, async () => response({ success: rejected }));
      p.fill();
      await p.submit().settled;
      assert.equal(p.status.dataset.state, 'error');
      assert.match(p.status.textContent, language === 'en' ? /could not confirm/ : /无法确认/);
      p.expectPreserved({ email: 'visitor@example.com', name: 'Sample Visitor', message: 'What is the price for 10 units of Octant?' });
      p.expectRestored();
    });
  }

  for (const providerMessage of ['Please activate your form', 'Please confirm your email', 'Please verify your email', 'Email verification required']) {
    test(`${language}: activation/verification message overrides true success (${providerMessage})`, async () => {
      const p = page(language, async () => response({ success: 'true', message: providerMessage }));
      p.fill();
      await p.submit().settled;
      assert.equal(p.status.dataset.state, 'error');
      assert.match(p.status.textContent, language === 'en' ? /temporarily unavailable/ : /暂未就绪/);
      p.expectPreserved({ email: 'visitor@example.com', message: 'What is the price for 10 units of Octant?' });
      p.expectRestored();
    });
  }

  const failures = [
    ['non-JSON response', async () => ({ ok: true, json: async () => { throw new SyntaxError('Unexpected HTML'); } })],
    ['HTTP error with success body', async () => response({ success: true }, false)],
    ['network rejection', async () => { throw new TypeError('Offline'); }],
    ['null JSON', async () => response(null)]
  ];
  for (const [label, fetchImplementation] of failures) {
    test(`${language}: ${label} retains input and restores UI`, async () => {
      const p = page(language, fetchImplementation);
      p.fill();
      await p.submit().settled;
      assert.equal(p.status.dataset.state, 'error');
      assert.equal(p.requests.length, 1, 'failure does not retry automatically');
      p.expectPreserved({ email: 'visitor@example.com', name: 'Sample Visitor', message: 'What is the price for 10 units of Octant?' });
      p.expectRestored();
    });
  }

  test(`${language}: double submit is suppressed; success retains edits made in flight`, async () => {
    const request = deferred();
    const p = page(language, () => request.promise);
    p.fill();
    const first = p.submit();
    await p.submit().settled;
    assert.equal(p.requests.length, 1);
    p.fields.message.value = 'Another question added while sending';
    request.resolve(response({ success: true }));
    await first.settled;
    assert.equal(p.status.dataset.state, 'success');
    p.expectPreserved({ email: 'visitor@example.com', message: 'Another question added while sending' });
    p.expectRestored();
  });

  test(`${language}: success preserves a topic changed in flight`, async () => {
    const request = deferred();
    const p = page(language, () => request.promise);
    p.fill();
    const submission = p.submit();
    p.fields.topic.value = 'support';
    request.resolve(response({ success: true }));
    await submission.settled;
    p.expectPreserved({ topic: 'support', message: 'What is the price for 10 units of Octant?' });
    p.expectRestored();
  });

  test(`${language}: abort timeout keeps input, never retries, and permits a later explicit retry`, async () => {
    let callCount = 0;
    const p = page(language, (url, { signal }) => {
      callCount++;
      if (callCount > 1) return Promise.resolve(response({ success: true }));
      return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true }));
    });
    p.fill();
    const submission = p.submit();
    assert.equal(p.timers.size, 1);
    const timer = [...p.timers.values()][0];
    assert.ok(timer.delay > 0 && timer.delay <= 30000, 'request timeout is bounded');
    timer.callback();
    await submission.settled;
    assert.equal(p.requests[0].options.signal.aborted, true);
    assert.equal(p.requests.length, 1);
    assert.equal(p.status.dataset.state, 'error');
    p.expectPreserved({ email: 'visitor@example.com', message: 'What is the price for 10 units of Octant?' });
    p.expectRestored();
    await p.submit().settled;
    assert.equal(p.requests.length, 2, 'only an explicit new submit starts the second request');
    assert.equal(p.status.dataset.state, 'success');
    p.expectRestored();
  });
}

for (const missingFeature of ['fetch', 'abort']) {
  test(`native form fallback remains available without ${missingFeature}`, async () => {
    const p = page('en', undefined, { [missingFeature]: false });
    p.fill();
    const submission = p.submit();
    await submission.settled;
    assert.equal(submission.event.prevented, false);
    assert.equal(p.requests.length, 0);
    assert.equal(p.form.getAttribute('action'), 'https://formsubmit.co/contact@xilume.co');
  });
}

(async () => {
  let failures = 0;
  for (const { name, run } of tests) {
    try {
      await run();
      console.log(`PASS ${name}`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${name}\n${error.stack}`);
    }
  }
  console.log(`${tests.length - failures}/${tests.length} contact-form scenarios passed. Offline DOM/fetch mocks only; no email or network requests were sent.`);
  if (failures) process.exitCode = 1;
})();
