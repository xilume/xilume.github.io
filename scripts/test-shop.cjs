// Offline checkout-state/security checks; no network, payments or browser rendering.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const shop = require('../shop/catalog.js');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let count = 0;
function test(name, run) { run(); count++; console.log(`PASS ${name}`); }

test('catalog matches the existing priced product schemas in both languages', () => {
  for (const item of Object.values(shop.products)) {
    for (const prefix of ['', 'zh-cn/']) {
      const html = read(prefix + item.path.slice(1) + 'index.html');
      const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      assert.equal(Math.round(Number(data.offers.price) * 100), item.priceCents);
      assert.equal(data.offers.priceCurrency, item.currency);
      assert.match(read(prefix + 'shop/index.html'), new RegExp(`\\$${(item.priceCents / 100).toString().replace('.', '\\.')}`));
      assert.ok(html.includes(`/${prefix}shop/checkout/?product=${item.id}`));
    }
  }
});

test('unknown and inherited product IDs cannot select a product', () => {
  for (const id of ['', null, '__proto__', 'constructor', 'toString', '<script>']) assert.equal(shop.product(id), null);
});

test('payment targets reject test, external, malformed and modified links', () => {
  const invalid = [null, '', 1, 'javascript:alert(1)', 'http://buy.stripe.com/abc',
    'https://buy.stripe.com.evil.invalid/abc', 'https://evil.invalid/abc',
    'https://buy.stripe.com/test_abc', 'https://u:p@buy.stripe.com/abc',
    'https://buy.stripe.com/abc?prefilled_amount=1', 'https://buy.stripe.com/abc#x',
    'https://buy.stripe.com/', 'https://buy.stripe.com/abc/def',
    ' https://buy.stripe.com/abc', 'https://buy.stripe.com/abc\n',
    'https://buy.stripe.com/a\tbc', 'https://buy.stripe.com:443/abc',
    'https://BUY.STRIPE.COM/abc', 'https://buy.stripe.com/test_bad/../abc',
    'https://buy.stripe.com/%2e%2e/abc', 'https://buy.stripe.com/abc?',
    'https://buy.stripe.com/abc#', 'https://buy.stripe.com/abc\\def'];
  for (const url of invalid) assert.equal(shop.paymentURL('dualcanfd', { dualcanfd: url }), null, String(url));
  assert.equal(shop.paymentURL('dualcanfd', Object.create({ dualcanfd: 'https://buy.stripe.com/fixture123' })), null);
  assert.equal(shop.paymentURL('unknown', { unknown: 'https://buy.stripe.com/fixture123' }), null);
  assert.equal(shop.paymentURL('dualcanfd', { dualcanfd: 'https://buy.stripe.com/fixture123' }), 'https://buy.stripe.com/fixture123');
});

function render(search, lang = 'en', links = {}, enabled = false) {
  const nodes = new Map();
  const get = selector => {
    if (!nodes.has(selector)) nodes.set(selector, { hidden: false, textContent: '', href: '' });
    return nodes.get(selector);
  };
  for (const selector of ['[data-product-review]', '[data-payment-ready]', '[data-payment-link]']) get(selector).hidden = true;
  const checkout = { querySelector: get };
  const document = { documentElement: { lang }, querySelector: selector => selector === '[data-checkout]' ? checkout : get(selector) };
  const window = { XilumeShop: shop, XILUME_PAYMENT_LINKS: links, XILUME_CHECKOUT_ENABLED: enabled, location: { href: 'https://xilume.co/shop/checkout/' + search } };
  vm.runInNewContext(read('shop/shop.js'), { window, document, URL });
  return get;
}

for (const lang of ['en', 'zh-CN']) {
  test(`${lang}: absent payment config gives a contact route, never a pay button`, () => {
    const get = render('?product=dualcanfd', lang);
    assert.equal(get('[data-product-review]').hidden, false);
    assert.equal(get('[data-product-selection]').hidden, true);
    assert.equal(get('[data-product-price]').textContent, 'US$69.99');
    assert.equal(get('[data-payment-link]').hidden, true);
    assert.equal(get('[data-payment-unavailable]').hidden, false);
    assert.equal(get('[data-product-contact]').href, `${lang === 'en' ? '' : '/zh-cn'}/contact/?product=dualcanfd`);
  });
  test(`${lang}: only configured SKU opens a hosted payment target`, () => {
    const get = render('?product=octant', lang, { octant: 'https://buy.stripe.com/fixture123' }, true);
    assert.equal(get('[data-product-price]').textContent, 'US$199.00');
    assert.equal(get('[data-payment-link]').hidden, false);
    assert.equal(get('[data-payment-link]').href, 'https://buy.stripe.com/fixture123');
    assert.equal(get('[data-payment-unavailable]').hidden, true);
    assert.equal(get('[data-payment-ready]').hidden, false);
    assert.equal(render('?product=dualcanfd', lang, { octant: 'https://buy.stripe.com/fixture123' }, true)('[data-payment-link]').hidden, true);
  });
}

for (const lang of ['en', 'zh-CN']) for (const id of Object.keys(shop.products)) {
  test(`${lang} ${id}: disabled gate wins over valid links and visitor parameters`, () => {
    for (const enabled of [false, undefined, null, 'true', 1, {}]) {
      const get = render(`?product=${id}&checkout=true&status=paid&session_id=fake`, lang,
        { [id]: 'https://buy.stripe.com/fixture123' }, enabled);
      assert.equal(get('[data-payment-link]').hidden, true);
      assert.equal(get('[data-payment-ready]').hidden, true);
      assert.equal(get('[data-payment-unavailable]').hidden, false);
      assert.equal(get('[data-shop-setup-notice]').hidden, false);
      assert.equal(get('[data-product-contact]').href, `${lang === 'en' ? '' : '/zh-cn'}/contact/?product=${id}`);
      assert.equal(get('[data-product-price]').textContent, `US$${(shop.products[id].priceCents / 100).toFixed(2)}`);
    }
  });
  test(`${lang} ${id}: an approved target never inherits URL amount or return state`, () => {
    const get = render(`?product=${id}&price=1&quantity=999&redirect=https://evil.invalid&status=paid&session_id=fake`,
      lang, { [id]: 'https://buy.stripe.com/fixture123' }, true);
    assert.equal(get('[data-payment-link]').href, 'https://buy.stripe.com/fixture123');
    assert.equal(get('[data-payment-link]').hidden, false);
    assert.equal(get('[data-product-price]').textContent, `US$${(shop.products[id].priceCents / 100).toFixed(2)}`);
  });
}

test('duplicate SKU targets fail closed; setup notice needs both distinct enabled links', () => {
  const duplicate = { dualcanfd: 'https://buy.stripe.com/fixture123', octant: 'https://buy.stripe.com/fixture123' };
  for (const id of Object.keys(shop.products)) {
    const get = render(`?product=${id}`, 'en', duplicate, true);
    assert.equal(get('[data-payment-link]').hidden, true);
    assert.equal(get('[data-shop-setup-notice]').hidden, false);
  }
  const distinct = { ...duplicate, octant: 'https://buy.stripe.com/fixture456' };
  assert.equal(render('', 'en', distinct, true)('[data-shop-setup-notice]').hidden, true);
  assert.equal(render('', 'en', distinct, false)('[data-shop-setup-notice]').hidden, false);
});

test('missing catalog leaves static contact links usable without an exception', () => {
  vm.runInNewContext(read('shop/shop.js'), { window: {} });
});

test('tampered price, quantity, redirect and success parameters do not change checkout', () => {
  const get = render('?product=dualcanfd&price=1&quantity=999&redirect=https://evil.invalid&status=paid&session_id=fake');
  assert.equal(get('[data-product-price]').textContent, 'US$69.99');
  assert.equal(get('[data-payment-link]').hidden, true);
  assert.equal(get('[data-payment-link]').href, '');
});
test('missing or invalid products preserve the no-script selection fallback', () => {
  for (const query of ['', '?product=invalid', '?product=__proto__']) {
    const get = render(query);
    assert.equal(get('[data-product-review]').hidden, true);
    assert.equal(get('[data-product-selection]').hidden, false);
  }
});

test('release stays locked: switch false and both exact SKU links null', () => {
  const window = {};
  vm.runInNewContext(read('shop/payment-links.js'), { window });
  assert.equal(window.XILUME_CHECKOUT_ENABLED, false);
  assert.deepEqual(Object.keys(window.XILUME_PAYMENT_LINKS).sort(), ['dualcanfd', 'octant']);
  assert.equal(Object.isFrozen(window.XILUME_PAYMENT_LINKS), true);
  for (const [id, value] of Object.entries(window.XILUME_PAYMENT_LINKS)) {
    assert.ok(shop.product(id));
    assert.equal(value, null, 'Activation requires a separate reviewed launch change');
  }
});

test('contact prefill uses known products, preserves drafts and never auto-submits', () => {
  for (const lang of ['en', 'zh-CN']) {
    for (const [query, initial, expected] of [
      ['?product=octant&email=private@example.invalid', '', '199.00'],
      ['?product=dualcanfd', 'Existing draft', 'Existing draft'],
      ['?product=__proto__', '', ''],
      ['?product=%3Cscript%3E', '', '']
    ]) {
      const field = { value: initial };
      const fields = { message: field, product: { value: '' }, intent: { value: '' }, topic: { value: 'price' } };
      const form = { elements: { namedItem: name => fields[name] || null }, querySelector: () => null, submit() { throw new Error('Automatic submit'); } };
      const document = { documentElement: { lang }, querySelector: () => form };
      const window = { XilumeShop: shop, location: { href: 'https://xilume.co/contact/' + query } };
      vm.runInNewContext(read('shop/contact-prefill.js'), { window, document, URL });
      if (expected === '199.00') assert.ok(field.value.includes(expected));
      else assert.equal(field.value, expected);
      assert.ok(!field.value.includes('private@example.invalid'));
    }
  }
});

test('fallback and accessibility essentials remain in both static checkout pages', () => {
  for (const prefix of ['', 'zh-cn/']) {
    const html = read(prefix + 'shop/checkout/index.html');
    assert.match(html, /name="robots" content="noindex, follow"/);
    assert.match(html, /data-product-review hidden/);
    assert.match(html, /data-payment-link hidden/);
    assert.ok(html.includes(`href="/${prefix}contact/"`));
    assert.ok(!html.includes('type="password"') && !html.includes('autocomplete="cc-number"'));
  }
});
console.log(`Passed ${count} shop checks (offline; no payment performed).`);
