(() => {
  'use strict';
  const shop = window.XilumeShop;
  const form = document.querySelector('[data-contact-form]');
  if (!shop || !form) return;
  const item = shop.product(new URL(window.location.href).searchParams.get('product'));
  const message = form.elements.namedItem('message');
  if (!item || !message || message.value.trim()) return;
  const zh = document.documentElement.lang.toLowerCase().startsWith('zh');
  const price = `US$${(item.priceCents / 100).toFixed(2)}`;
  message.value = zh
    ? `我想购买 ${item.nameZh}（官网单价 ${price}）\n数量：\n收货国家或地区：\n请确认供货情况、运费及交期`
    : `I would like to order ${item.name} (listed unit price ${price}).\nQuantity:\nShipping country or region:\nPlease confirm availability, shipping cost and delivery timing.`;
  // Do not submit, persist, or forward arbitrary URL data.
})();
