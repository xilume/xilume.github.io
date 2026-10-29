(function (root) {
  'use strict';
  const products = Object.freeze({
    dualcanfd: Object.freeze({
      id: 'dualcanfd', name: 'Dual Mini PCIe CAN FD', nameZh: '双路 Mini PCIe CAN FD',
      priceCents: 6999, currency: 'USD',
      image: '/images/shop-dual-canfd-xl1326-a-studio-v1.webp',
      path: '/products/mini-pcie-dual-can-fd/',
      summary: 'Two isolated CAN / CAN FD channels. Windows and Linux drivers.',
      summaryZh: '双路隔离 CAN / CAN FD，支持 Windows 与 Linux 驱动',
      included: 'Full-height bracket and two DB9 breakout cables included.',
      includedZh: '含全高扩展挡板及两条 DB9 转接线'
    }),
    octant: Object.freeze({
      id: 'octant', name: 'Octant', nameZh: 'Octant',
      priceCents: 19900, currency: 'USD',
      image: '/images/shop-octant-studio-v1.webp', path: '/products/8hub/',
      summary: 'USB communication hub. 2 CAN FD, 4 RS-485 and 2 RS-232 channels.',
      summaryZh: 'USB 工业通信扩展坞，提供 2 路 CAN FD、4 路 RS-485、2 路 RS-232',
      included: 'Single-unit hardware. Academic and volume pricing available by enquiry.',
      includedZh: '单台硬件，教育及批量采购价格请咨询'
    })
  });

  function product(id) {
    return Object.prototype.hasOwnProperty.call(products, id) ? products[id] : null;
  }

  // Only a maintained, live Stripe Payment Link may become a payment target.
  // URL query parameters from visitors never set a price, quantity or redirect.
  function paymentURL(id, links) {
    if (!product(id) || !links || !Object.prototype.hasOwnProperty.call(links, id)) return null;
    const value = links[id];
    // Check the original string before URL parsing can normalize whitespace,
    // backslashes, dot segments or an explicit port into a permitted URL.
    if (typeof value !== 'string' || !/^https:\/\/buy\.stripe\.com\/[a-zA-Z0-9]+$/.test(value)) return null;
    try {
      const url = new URL(value);
      if (url.origin !== 'https://buy.stripe.com' || url.username || url.password ||
          url.search || url.hash || !/^\/[a-zA-Z0-9]+$/.test(url.pathname)) return null;
      return url.href === value ? value : null;
    } catch (_) { return null; }
  }

  function checkoutURL(id, links, enabled) {
    if (enabled !== true) return null;
    const url = paymentURL(id, links);
    // A copy/paste mistake must not send two SKUs to the same checkout.
    if (!url || Object.keys(products).some(other => other !== id && paymentURL(other, links) === url)) return null;
    return url;
  }

  const api = Object.freeze({ products, product, paymentURL, checkoutURL });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XilumeShop = api;
})(typeof window !== 'undefined' ? window : globalThis);
