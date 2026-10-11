(() => {
  'use strict';
  const shop = window.XilumeShop;
  if (!shop) return; // The static contact / product links remain usable.
  const zh = document.documentElement.lang.toLowerCase().startsWith('zh');
  const prefix = zh ? '/zh-cn' : '';
  const links = window.XILUME_PAYMENT_LINKS;
  const setupNotice = document.querySelector('[data-shop-setup-notice]');
  if (setupNotice && Object.keys(shop.products).every(id => shop.paymentURL(id, links))) {
    setupNotice.hidden = true;
  }

  const checkout = document.querySelector('[data-checkout]');
  if (!checkout) return;
  const id = new URL(window.location.href).searchParams.get('product');
  const item = shop.product(id);
  if (!item) return; // Unknown products keep the static selection state.

  const setText = (selector, text) => { checkout.querySelector(selector).textContent = text; };
  setText('[data-product-name]', zh ? item.nameZh : item.name);
  setText('[data-product-summary]', zh ? item.summaryZh : item.summary);
  setText('[data-product-included]', zh ? item.includedZh : item.included);
  setText('[data-product-price]', `US$${(item.priceCents / 100).toFixed(2)}`);
  const photo = checkout.querySelector('[data-product-image]');
  photo.src = item.image;
  photo.alt = zh ? item.nameZh : item.name;
  checkout.querySelector('[data-product-details]').href = prefix + item.path;
  checkout.querySelector('[data-product-contact]').href = `${prefix}/contact/?product=${item.id}`;

  const payment = shop.paymentURL(id, links);
  if (payment) {
    const payLink = checkout.querySelector('[data-payment-link]');
    payLink.href = payment;
    payLink.hidden = false;
    checkout.querySelector('[data-payment-ready]').hidden = false;
    checkout.querySelector('[data-payment-unavailable]').hidden = true;
    setText('[data-checkout-title]', zh ? '确认商品' : 'Review your product');
  }
  checkout.querySelector('[data-product-selection]').hidden = true;
  checkout.querySelector('[data-product-review]').hidden = false;
})();
