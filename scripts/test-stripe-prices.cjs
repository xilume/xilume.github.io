// Offline fixtures only: no Stripe credentials, customer data, payments or HTTP.
'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { products } = require('../shop/catalog.js');
const { validateConfig, validateProduct, createReader, audit } = require('./audit-stripe-prices.cjs');
const config = { mode: 'test', accountId: 'acct_fixture', products: {
  dualcanfd: { productId: 'prod_dual', priceId: 'price_dual', paymentLinkId: 'plink_dual' },
  octant: { productId: 'prod_octant', priceId: 'price_octant', paymentLinkId: 'plink_octant' }
} };

function fixture(id, mode = 'test') {
  const ids = config.products[id];
  const metadata = { sku: id === 'dualcanfd' ? 'XILUME-DUAL-MINIPCIE-CAN-FD' : 'XILUME-OCTANT' };
  const shared = { active: true, livemode: mode === 'live', metadata };
  const price = { ...shared, id: ids.priceId, object: 'price', product: ids.productId,
    currency: 'usd', unit_amount: products[id].priceCents, type: 'one_time', recurring: null,
    billing_scheme: 'per_unit', custom_unit_amount: null, transform_quantity: null, tiers_mode: null };
  return {
    product: { ...shared, id: ids.productId, object: 'product' }, price,
    link: { ...shared, id: ids.paymentLinkId, object: 'payment_link', currency: 'usd',
      url: `https://buy.stripe.com/${mode === 'test' ? 'test_' : ''}${id}fixture`,
      allow_promotion_codes: false, after_completion: { type: 'hosted_confirmation' } },
    lineItems: { object: 'list', has_more: false, data: [
      { price, quantity: 1, currency: 'usd', amount_subtotal: products[id].priceCents, adjustable_quantity: null }
    ] }
  };
}

for (const id of Object.keys(products)) {
  test(`${id}: exact sandbox and live fixtures pass price validation only`, () => {
    for (const mode of ['test', 'live']) assert.deepEqual(validateProduct(id, config.products[id], mode, fixture(id, mode)), []);
  });
}

const mutations = {
  'wrong amount': s => { s.price.unit_amount = 1; },
  'fractional amount': s => { s.price.unit_amount_decimal = '6999.1'; },
  'wrong currency': s => { s.price.currency = 'eur'; },
  'recurring price': s => { s.price.type = 'recurring'; s.price.recurring = { interval: 'month' }; },
  'customer entered amount': s => { s.price.custom_unit_amount = { enabled: true }; },
  'quantity transformation': s => { s.price.transform_quantity = { divide_by: 10, round: 'up' }; },
  'tiered price': s => { s.price.billing_scheme = 'tiered'; },
  'extra manual currency': s => { s.price.currency_options = { eur: { unit_amount: 1 } }; },
  'inactive price': s => { s.price.active = false; },
  'inactive product': s => { s.product.active = false; },
  'inactive link': s => { s.link.active = false; },
  'swapped product': s => { s.price.product = 'prod_octant'; },
  'swapped price': s => { s.lineItems.data[0].price = { id: 'price_octant' }; },
  'wrong SKU metadata': s => { s.product.metadata = { sku: 'XILUME-OCTANT' }; },
  'mixed price mode': s => { s.price.livemode = true; },
  'mixed link mode': s => { s.link.livemode = true; },
  'mixed product mode': s => { s.product.livemode = true; },
  'live URL in sandbox': s => { s.link.url = 'https://buy.stripe.com/fixture'; },
  'query in URL': s => { s.link.url += '?amount=1'; },
  'trailing whitespace in URL': s => { s.link.url += '\n'; },
  'unreviewed redirect': s => { s.link.after_completion.type = 'redirect'; },
  'unreviewed discount': s => { s.link.allow_promotion_codes = true; },
  'unreviewed optional item': s => { s.link.optional_items = [{ price: 'price_extra' }]; },
  'unexpected merchant': s => { s.link.on_behalf_of = 'acct_other'; },
  'manual capture': s => { s.link.payment_intent_data = { capture_method: 'manual' }; },
  'multiple line items': s => { s.lineItems.data.push(s.lineItems.data[0]); },
  'incomplete pagination': s => { s.lineItems.has_more = true; },
  'empty line items': s => { s.lineItems.data = []; },
  'missing price': s => { delete s.price; },
  'missing list': s => { delete s.lineItems; },
  'quantity mismatch': s => { s.lineItems.data[0].quantity = 2; },
  'subtotal mismatch': s => { s.lineItems.data[0].amount_subtotal = 1; },
  'invalid quantity bounds': s => { s.lineItems.data[0].adjustable_quantity = { enabled: true, minimum: 0, maximum: 10 }; }
};
for (const [name, mutate] of Object.entries(mutations)) {
  test(`reject ${name}`, () => {
    const snapshot = fixture('dualcanfd');
    mutate(snapshot);
    assert.ok(validateProduct('dualcanfd', config.products.dualcanfd, 'test', snapshot).length > 0);
  });
}

test('configuration rejects missing identities, extra SKUs, duplicates and injected paths before network', async () => {
  assert.deepEqual(validateConfig(config), []);
  for (const candidate of [null, {}, { ...config, mode: 'unknown' },
    { ...config, accountId: null }, { ...config, products: {} },
    { ...config, products: { ...config.products, extra: {} } },
    { ...config, products: { dualcanfd: config.products.dualcanfd, octant: config.products.dualcanfd } },
    { ...config, products: { ...config.products, dualcanfd: { ...config.products.dualcanfd, priceId: 'price_x/../../customers' } } }
  ]) {
    assert.ok(validateConfig(candidate).length);
    await assert.rejects(audit(candidate, () => assert.fail('Unexpected network request')));
  }
});

test('account mismatch stops before retrieving any product data', async () => {
  const requests = [];
  await assert.rejects(audit(config, async resource => { requests.push(resource); return { object: 'account', id: 'acct_other' }; }), /identity mismatch/);
  assert.deepEqual(requests, ['/account']);
});

test('successful audit stays not-ready and does not expose account/customer data', async () => {
  const snapshots = Object.keys(products).map(id => fixture(id));
  const report = await audit(config, async resource => {
    if (resource === '/account') return { object: 'account', id: config.accountId, email: 'private@example.invalid' };
    for (const snapshot of snapshots) {
      if (resource.endsWith('/line_items') && resource.includes(snapshot.link.id)) return snapshot.lineItems;
      for (const key of ['product', 'price', 'link']) if (resource.endsWith('/' + snapshot[key].id)) return snapshot[key];
    }
    assert.fail('Unexpected resource');
  });
  assert.equal(report.readyForLivePayments, false);
  assert.equal(report.outstanding.length, 6);
  assert.ok(Object.values(report.products).every(item => item.errors.length === 0));
  assert.ok(!JSON.stringify(report).includes('private@example.invalid'));
});

test('reader restricts credentials, methods, origins and redirects', async () => {
  const key = ['rk', 'test', 'fixture'].join('_');
  for (const bad of [undefined, '', ['sk', 'test', 'fixture'].join('_'), ['rk', 'live', 'fixture'].join('_')]) {
    assert.throws(() => createReader(bad, 'test'), /restricted read key/);
  }
  const requests = [];
  const reader = createReader(key, 'test', async (url, options) => {
    requests.push({ url, options }); return { ok: true, json: async () => ({ object: 'account' }) };
  });
  await reader('/account');
  assert.equal(requests[0].url, 'https://api.stripe.com/v1/account');
  assert.equal(requests[0].options.method, 'GET');
  assert.equal(requests[0].options.redirect, 'error');
  for (const path of ['https://evil.invalid', '//evil.invalid', '/customers', '/prices/price_a?next=evil', '/account\n']) {
    await assert.rejects(reader(path), /Unsupported read resource/);
  }
  assert.equal(requests.length, 1);
});

test('reader errors never include keys or raw API response bodies', async () => {
  const key = ['rk', 'test', 'fixture'].join('_');
  for (const fakeFetch of [
    async () => { throw new Error(key); },
    async () => ({ ok: false, status: 403, json: async () => ({ error: key }) }),
    async () => ({ ok: true, json: async () => { throw new Error(key); } })
  ]) {
    await assert.rejects(createReader(key, 'test', fakeFetch)('/account'), error => !error.message.includes(key));
  }
});
