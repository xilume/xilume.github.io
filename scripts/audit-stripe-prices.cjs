// Read-only maintainer tool. Never shipped to browsers; never enables checkout.
// Usage: STRIPE_READ_ONLY_KEY (from a secret store) node scripts/audit-stripe-prices.cjs /outside/repo/config.json
'use strict';
const fs = require('node:fs');
const { products, paymentURL } = require('../shop/catalog.js');

const skuMetadata = Object.freeze({
  'mini-pcie-canfd-rs485': 'XILUME-MINIPCIE-CANFD-RS485',
  dualcanfd: 'XILUME-DUAL-MINIPCIE-CAN-FD', octant: 'XILUME-OCTANT'
});
const has = (object, key) => object && Object.prototype.hasOwnProperty.call(object, key);
const objectId = object => typeof object === 'string' ? object : object?.id;

function validateConfig(config) {
  const errors = [];
  if (!config || !['test', 'live'].includes(config.mode)) errors.push('mode must be test or live');
  if (!/^acct_[a-zA-Z0-9]+$/.test(config?.accountId || '')) errors.push('accountId is required');
  const seen = new Set();
  if (!config?.products || Object.keys(config.products).sort().join(',') !== Object.keys(products).sort().join(',')) {
    errors.push(`products must contain exactly ${Object.keys(products).sort().join(', ')}`);
  }
  for (const id of Object.keys(products)) {
    const entry = has(config?.products, id) ? config.products[id] : null;
    for (const [field, prefix] of [['productId', 'prod'], ['priceId', 'price'], ['paymentLinkId', 'plink']]) {
      const value = entry?.[field];
      if (typeof value !== 'string' || !new RegExp(`^${prefix}_[a-zA-Z0-9]+$`).test(value)) {
        errors.push(`${id}: ${field} is required`);
      } else if (seen.has(value)) errors.push(`${id}: duplicate ${field}`);
      else seen.add(value);
    }
  }
  return errors;
}

// Inspect objects retrieved from the intended Stripe account. A URL alone
// cannot authenticate its merchant, product, price, availability or mode.
function validateProduct(id, expected, mode, snapshot) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const item = has(products, id) ? products[id] : null;
  if (!item || !expected || !snapshot || !['test', 'live'].includes(mode)) return ['Invalid audit input'];
  const { product, price, link, lineItems } = snapshot;
  const live = mode === 'live';
  for (const [label, value, expectedId, type] of [
    ['Product', product, expected.productId, 'product'],
    ['Price', price, expected.priceId, 'price'],
    ['Payment Link', link, expected.paymentLinkId, 'payment_link']
  ]) {
    check(value?.object === type && value.id === expectedId, `${label} identity mismatch`);
    check(value?.active === true, `${label} must be active`);
    check(value?.livemode === live, `${label} mode mismatch`);
    check(value?.metadata?.sku === skuMetadata[id], `${label} SKU mismatch`);
  }
  check(price?.product === expected.productId || price?.product?.id === expected.productId, 'Price product mismatch');
  check(price?.currency === item.currency.toLowerCase(), 'Price currency mismatch');
  check(price?.unit_amount === item.priceCents &&
    (price?.unit_amount_decimal == null || Number(price.unit_amount_decimal) === item.priceCents), 'Price amount mismatch');
  check(price?.type === 'one_time' && price?.recurring == null, 'Price must be one-time');
  check(price?.billing_scheme === 'per_unit' && price?.custom_unit_amount == null &&
    price?.transform_quantity == null && price?.tiers_mode == null, 'Price must be fixed per-unit');
  check(!price?.currency_options || Object.keys(price.currency_options).every(currency => currency === 'usd'),
    'Additional manual price currencies need review');
  check(link?.currency === 'usd', 'Payment Link currency mismatch');
  const validURL = mode === 'live' ? paymentURL(id, { [id]: link?.url }) :
    typeof link?.url === 'string' && /^https:\/\/buy\.stripe\.com\/test_[a-zA-Z0-9]+$/.test(link.url) &&
    new URL(link.url).href === link.url;
  check(Boolean(validURL), 'Payment Link URL or mode mismatch');
  check(link?.allow_promotion_codes === false, 'Promotion codes need owner review');
  check(!link?.optional_items?.length, 'Optional items need owner review');
  check(link?.after_completion?.type === 'hosted_confirmation', 'Use Stripe hosted confirmation until a verified return flow exists');
  check(!link?.on_behalf_of && !link?.transfer_data, 'Unexpected connected merchant or transfer');
  check(!link?.payment_intent_data?.capture_method || link.payment_intent_data.capture_method === 'automatic',
    'Manual capture needs a separate order flow');
  check(lineItems?.object === 'list' && lineItems?.has_more === false &&
    Array.isArray(lineItems.data) && lineItems.data.length === 1, 'Expected exactly one complete line item');
  const line = lineItems?.data?.[0];
  check(objectId(line?.price) === expected.priceId, 'Payment Link points to the wrong Price');
  check(line?.quantity === 1 && line?.currency === 'usd' && line?.amount_subtotal === item.priceCents,
    'Initial quantity or line subtotal mismatch');
  const adjustable = line?.adjustable_quantity;
  check(adjustable == null || adjustable.enabled === false ||
    (adjustable.enabled === true && Number.isSafeInteger(adjustable.minimum) && adjustable.minimum >= 1 &&
      Number.isSafeInteger(adjustable.maximum) && adjustable.maximum >= adjustable.minimum &&
      adjustable.minimum <= 1), 'Invalid quantity bounds');
  return errors;
}

function createReader(key, mode, fetchImpl = fetch) {
  // Refuse full-access keys; supply a restricted key with only read permissions.
  if (!['test', 'live'].includes(mode) || typeof key !== 'string' ||
      !new RegExp(`^rk_${mode}_[a-zA-Z0-9]+$`).test(key)) {
    throw new Error('Use a restricted read key matching the requested test/live mode in STRIPE_READ_ONLY_KEY');
  }
  return async resource => {
    if (!/^\/(account|products\/prod_[a-zA-Z0-9]+|prices\/price_[a-zA-Z0-9]+|payment_links\/plink_[a-zA-Z0-9]+(?:\/line_items)?)$/.test(resource)) {
      throw new Error('Unsupported read resource');
    }
    let response;
    try {
      response = await fetchImpl(`https://api.stripe.com/v1${resource}`, {
        method: 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': '2026-08-26.dahlia' }
      });
    } catch (_) { throw new Error('Stripe read failed; check network access (no response body logged)'); }
    if (!response.ok) throw new Error(`Stripe read failed (HTTP ${response.status}); check read permissions and object IDs`);
    try { return await response.json(); }
    catch (_) { throw new Error('Invalid Stripe response (no response body logged)'); }
  };
}

async function audit(config, read) {
  const configErrors = validateConfig(config);
  if (configErrors.length) throw new Error(configErrors.join('; '));
  const account = await read('/account');
  if (account?.object !== 'account' || account.id !== config.accountId) throw new Error('Stripe account identity mismatch');
  const report = {
    scope: 'Price and Payment Link audit only; not launch authorization or a payment test',
    mode: config.mode, readyForLivePayments: false, products: {},
    outstanding: ['Owner merchant/bank verification', 'Owner stock and quantity limits',
      'Owner shipping destinations/rates and dispatch timing', 'Owner policies and tax decision',
      'Signed, durable and idempotent order webhooks', 'Receipt delivery and end-to-end payment tests']
  };
  for (const id of Object.keys(products)) {
    const expected = config.products[id];
    const [product, price, link, lineItems] = await Promise.all([
      read(`/products/${expected.productId}`), read(`/prices/${expected.priceId}`),
      read(`/payment_links/${expected.paymentLinkId}`), read(`/payment_links/${expected.paymentLinkId}/line_items`)
    ]);
    report.products[id] = {
      errors: validateProduct(id, expected, config.mode, { product, price, link, lineItems }),
      expectedPriceCents: products[id].priceCents, expectedCurrency: 'usd',
      observed: {
        quantity: lineItems?.data?.[0]?.quantity ?? null,
        adjustableQuantity: lineItems?.data?.[0]?.adjustable_quantity ?? null,
        shippingCountries: link?.shipping_address_collection?.allowed_countries ?? [],
        shippingRateCount: link?.shipping_options?.length ?? 0,
        automaticTax: link?.automatic_tax?.enabled ?? null,
        taxBehavior: price?.tax_behavior ?? null,
        taxCode: objectId(product?.tax_code) ?? null
      }
    };
  }
  return report;
}

if (require.main === module) {
  (async () => {
    if (process.argv.length !== 3) throw new Error('Usage: node scripts/audit-stripe-prices.cjs /outside/repo/config.json');
    let config;
    try { config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); }
    catch (_) { throw new Error('Cannot read a valid audit configuration'); }
    const errors = validateConfig(config);
    if (errors.length) throw new Error(errors.join('; '));
    const report = await audit(config, createReader(process.env.STRIPE_READ_ONLY_KEY, config.mode));
    console.log(JSON.stringify(report, null, 2));
    if (Object.values(report.products).some(item => item.errors.length)) process.exitCode = 1;
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { validateConfig, validateProduct, createReader, audit };
