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
const prefillSource = fs.readFileSync(path.join(root, 'shop/contact-prefill.js'), 'utf8');
const catalog = require('../shop/catalog.js');
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
  assert.match(html, /data-contact-context hidden/, 'product context stays hidden without JavaScript');
  const context = new Element();
  context.selector = '[data-contact-context]';
  context.hidden = true;
  const productName = new Element();
  productName.selector = '[data-contact-product]';
  const intentName = new Element();
  intentName.selector = '[data-contact-intent]';
  const productLink = new Element();
  productLink.selector = '[data-contact-product-link]';
  productLink.href = '';
  context.children = [productName, intentName, productLink];
  form.children = [button, status, context];
  const copyButton = new Element();
  copyButton.hidden = true;
  const copyStatus = new Element();
  form.elements = { namedItem(name) { return fields[name] ?? null; } };
  form.querySelector = selector => selector === '[data-contact-submit-label]' ? button.querySelector(selector) : form.children.find(child => child.selector === selector) ?? null;
  form.reportValidity = () => Object.values(fields).every(field => field.checkValidity());
  form.resetCount = 0;
  form.reset = () => {
    form.resetCount++;
    for (const field of Object.values(fields)) field.value = field.defaultValue;
  };
  form.submit = form.requestSubmit = () => { throw new Error('Automatic form submission'); };
  for (const [name, value] of Object.entries(features.initialFields || {})) fields[name].value = value;
  const requests = [];
  const clipboardWrites = [];
  const timers = new Map();
  let nextTimer = 0;
  const window = {
    // A synthetic visitor URL catches accidental forwarding of query/hash data.
    location: new URL(features.url || 'https://xilume.co/contact/?private=visitor-only@example.invalid&token=DO_NOT_FORWARD#private-fragment'),
    XilumeShop: features.catalog === false ? undefined : catalog,
    navigator: features.clipboard === false ? {} : { clipboard: { async writeText(value) {
      if (features.clipboardFailure) throw new Error('Clipboard access denied');
      clipboardWrites.push(value);
    } } },
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
    querySelector: selector => ({
      '[data-contact-form]': form,
      '[data-contact-copy-email]': copyButton,
      '[data-contact-copy-status]': copyStatus
    }[selector] || null)
  };
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('Visitor input must not be persisted'); } });
  const noLogging = { log() { throw new Error('Visitor input must not be logged'); }, error() { throw new Error('Visitor input must not be logged'); } };
  // No host fetch or filesystem APIs are exposed to the tested script.
  vm.runInNewContext(source, { window, document, AbortController: window.AbortController, console: noLogging }, { filename: 'contact/contact.js' });
  vm.runInNewContext(prefillSource, { window, document, URL, console: noLogging }, { filename: 'shop/contact-prefill.js' });
  const idleLabel = label.textContent;
  return {
    form, fields, button, label, icon, status, requests, timers, idleLabel,
    context, productName, intentName, productLink, copyButton, copyStatus, clipboardWrites,
    copyEmail() { return copyButton.emit('click'); },
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

  test(`${language}: email copy works only on click and failures give a manual fallback`, async () => {
    for (const options of [{}, { clipboardFailure: true }, { clipboard: false }]) {
      const p = page(language, undefined, { ...options, initialFields: { message: 'Keep this draft' } });
      assert.equal(p.copyButton.hidden, false);
      assert.equal(p.clipboardWrites.length, 0, 'loading never writes to the clipboard');
      await p.copyEmail();
      if (options.clipboardFailure || options.clipboard === false) {
        assert.equal(p.clipboardWrites.length, 0);
        assert.match(p.copyStatus.textContent, language === 'en' ? /copy it manually/ : /手动复制/);
      } else {
        assert.deepEqual(p.clipboardWrites, ['contact@xilume.co']);
        assert.match(p.copyStatus.textContent, /contact@xilume\.co/);
      }
      assert.equal(p.requests.length, 0);
      p.expectPreserved({ message: 'Keep this draft' });
    }
  });

  const products = {
    'mini-pcie-canfd-rs485': ['Mini PCIe CAN FD + RS-485', 'Mini PCIe CAN FD + RS-485 扩展卡', '/products/mini-pcie-canfd-rs485/'],
    dualcanfd: ['Dual Mini PCIe CAN FD', '双路 Mini PCIe CAN FD', '/products/mini-pcie-dual-can-fd/'],
    octant: ['Octant', 'Octant', '/products/8hub/'],
    xe826: ['XE826', 'XE826', '/products/8hub-embedded/'],
    xl1326: ['XL1326', 'XL1326', '/products/interface-ics/xl1326/'],
    'xl1326-a': ['XL1326-A', 'XL1326-A', '/products/interface-ics/xl1326-a/'],
    'interface-ics': ['Xilume interface ICs', '熙联迈接口芯片', '/products/interface-ics/']
  };
  for (const [id, [enName, zhName, productPath]] of Object.entries(products)) {
    test(`${language} ${id}: product context and four editable intent templates`, () => {
      const prefix = language === 'en' ? '' : '/zh-cn';
      for (const intent of ['order', 'quote', 'samples', 'integration', null]) {
        const p = page(language, undefined, {
          url: `https://xilume.co${prefix}/contact/?product=${id}${intent ? '&intent=' + intent : ''}&email=DO_NOT_FORWARD&message=DO_NOT_FORWARD&price=0&redirect=https://evil.invalid#private-fragment`
        });
        const effectiveIntent = intent || (catalog.product(id) ? 'order' : 'quote');
        assert.equal(p.context.hidden, false);
        assert.equal(p.productName.textContent, language === 'en' ? enName : zhName);
        assert.equal(p.productLink.href, prefix + productPath);
        assert.equal(p.fields.product.value, id);
        assert.equal(p.fields.intent.value, effectiveIntent);
        assert.equal(p.fields.topic.value, effectiveIntent === 'samples' ? 'samples' : effectiveIntent === 'integration' ? 'selection' : 'price');
        assert.ok(p.fields.message.value.includes(language === 'en' ? enName : zhName));
        assert.ok(p.fields.message.value.includes('\n'), 'template uses actual editable line breaks');
        assert.equal(p.fields.email.value, '', 'query cannot fill an email');
        assert.equal(p.fields.name.value, '');
        assert.deepEqual(Object.entries(p.fields).filter(([, field]) => field.required).map(([name]) => name).sort(), ['email', 'message']);
        if (!catalog.product(id) || effectiveIntent !== 'order') assert.doesNotMatch(p.fields.message.value, /US\$/);
        if (effectiveIntent === 'order' && catalog.product(id)) assert.ok(p.fields.message.value.includes(`US$${(catalog.product(id).priceCents / 100).toFixed(2)}`));
        assert.doesNotMatch(JSON.stringify(Object.fromEntries(Object.entries(p.fields).map(([name, field]) => [name, field.value]))), /DO_NOT_FORWARD|evil\.invalid|private-fragment/);
        assert.equal(p.requests.length, 0, 'prefill never calls the network');
      }
    });
  }

  test(`${language}: unknown, inherited and ambiguous query values leave a normal blank form`, () => {
    for (const query of ['', '?intent=samples', '?product=unknown', '?product=__proto__', '?product=constructor',
      '?product=toString', '?product=%3Cscript%3E', '?product=XL1326-A', '?product=xl1326-a&intent=unknown',
      '?product=octant&intent=__proto__', '?product=octant&intent=', '?product=octant&product=xe826',
      '?product=octant&intent=quote&intent=samples']) {
      const p = page(language, undefined, { url: 'https://xilume.co/contact/' + query });
      assert.equal(p.context.hidden, true, query);
      assert.equal(p.fields.message.value, '', query);
      assert.equal(p.fields.product.value, '', query);
      assert.equal(p.fields.intent.value, '', query);
    }
  });

  test(`${language}: restored drafts and custom topic survive prefill, catalog is optional`, () => {
    for (const draft of ['An existing project question', '  ', '\nKeep all lines\n']) {
      const initialFields = { message: draft, email: 'existing@example.invalid', name: 'Existing Name', topic: 'support' };
      const p = page(language, undefined, { url: 'https://xilume.co/contact/?product=xl1326-a&intent=samples', initialFields, catalog: false });
      p.expectPreserved(initialFields);
      assert.equal(p.context.hidden, false);
      assert.equal(p.fields.product.value, 'xl1326-a');
    }
    const p = page(language, undefined, { url: 'https://xilume.co/contact/?product=xe826&intent=integration', catalog: false, initialFields: { topic: 'support' } });
    assert.equal(p.fields.topic.value, 'support', 'a restored non-default topic is preserved');
    assert.ok(p.fields.message.value.includes('XE826'));
    assert.doesNotMatch(p.fields.message.value, /US\$/);
  });
}

(async () => {
  for (const { name, run } of tests) {
    await run();
    console.log(`PASS ${name}`);
  }
  console.log(`Passed ${tests.length} contact form scenarios (offline; no email sent).`);
})().catch(error => { console.error(error); process.exitCode = 1; });
