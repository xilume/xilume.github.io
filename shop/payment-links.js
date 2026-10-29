// Public URLs only. Never add Stripe secret keys to this repository.
// Keep the switch false and all links null until merchant verification,
// fixed prices, stock, shipping, policies and end-to-end payment/order tests pass.
// See docs/WEBSITE_SHOP.md before activation.
// This is a deployment safeguard, not payment authorization or an inventory lock.
window.XILUME_CHECKOUT_ENABLED = false;
window.XILUME_PAYMENT_LINKS = Object.freeze({
  'mini-pcie-canfd-rs485': null,
  dualcanfd: null,
  octant: null
});
