(() => {
  'use strict';
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const products = {
    dualcanfd: { name: 'Dual Mini PCIe CAN FD', zh: '双路 Mini PCIe CAN FD', path: '/products/mini-pcie-dual-can-fd/', defaultIntent: 'order' },
    octant: { name: 'Octant', zh: 'Octant', path: '/products/8hub/', defaultIntent: 'order' },
    xe826: { name: 'XE826', zh: 'XE826', path: '/products/8hub-embedded/', defaultIntent: 'quote' },
    xl1326: { name: 'XL1326', zh: 'XL1326', path: '/products/interface-ics/xl1326/', defaultIntent: 'quote' },
    'xl1326-a': { name: 'XL1326-A', zh: 'XL1326-A', path: '/products/interface-ics/xl1326-a/', defaultIntent: 'quote' },
    'interface-ics': { name: 'Xilume interface ICs', zh: '熙联迈接口芯片', path: '/products/interface-ics/', defaultIntent: 'quote' }
  };
  const intents = {
    order: { en: 'Order enquiry', zh: '采购咨询' },
    quote: { en: 'Pricing enquiry', zh: '价格咨询' },
    samples: { en: 'Evaluation samples', zh: '评估样品' },
    integration: { en: 'OEM integration', zh: 'OEM 集成咨询' }
  };
  const params = new URL(window.location.href).searchParams;
  // Ambiguous or unrecognized values leave the ordinary contact form intact.
  const id = params.get('product');
  if (params.getAll('product').length !== 1 || !Object.prototype.hasOwnProperty.call(products, id)) return;
  const item = products[id];
  const intent = params.has('intent') ? params.get('intent') : item.defaultIntent;
  if (params.getAll('intent').length > 1 || !Object.prototype.hasOwnProperty.call(intents, intent)) return;
  const message = form.elements.namedItem('message');
  if (!message) return;
  const zh = document.documentElement.lang.toLowerCase().startsWith('zh');
  const name = zh ? item.zh : item.name;
  const context = form.querySelector('[data-contact-context]');
  if (context) {
    context.querySelector('[data-contact-product]').textContent = name;
    context.querySelector('[data-contact-intent]').textContent = zh ? intents[intent].zh : intents[intent].en;
    context.querySelector('[data-contact-product-link]').href = `${zh ? '/zh-cn' : ''}${item.path}`;
    context.hidden = false;
  }
  for (const [fieldName, value] of [['product', id], ['intent', intent]]) {
    const field = form.elements.namedItem(fieldName);
    if (field) field.value = value;
  }
  // Preserve restored drafts, including whitespace, without touching other fields.
  if (message.value !== '') return;
  const topic = form.elements.namedItem('topic');
  if (topic && topic.value === 'price') {
    topic.value = intent === 'samples' ? 'samples' : intent === 'integration' ? 'selection' : 'price';
  }
  const shop = window.XilumeShop;
  const priced = shop && typeof shop.product === 'function' ? shop.product(id) : null;
  const price = priced ? `US$${(priced.priceCents / 100).toFixed(2)}` : '';
  const templates = zh ? {
    order: `我想购买 ${name}${price ? `（官网单价 ${price}）` : ''}\n数量（如已确定）：\n收货国家或地区（如已确定）：\n请确认供货情况、运费及交期`,
    quote: `请提供 ${name} 的报价\n数量（如已确定）：\n交付国家或地区（如已确定）：\n请确认价格及交期`,
    samples: `我想了解 ${name} 的评估样品\n样品数量（如已确定）：\n应用方向（选填）：\n请确认样品供货情况及价格`,
    integration: `我正在评估将 ${name} 用于 OEM 设计\n主机系统或目标接口（如已确定）：\n应用方向或集成问题：\n希望了解选型建议及现有集成资料`
  } : {
    order: `I would like to order ${name}${price ? ` (listed unit price ${price})` : ''}.\nQuantity (if known):\nShipping country or region (if known):\nPlease confirm availability, shipping cost and delivery timing.`,
    quote: `Please quote ${name}.\nQuantity (if known):\nDelivery country or region (if known):\nPlease confirm pricing and lead time.`,
    samples: `I would like to ask about evaluation samples of ${name}.\nSample quantity (if known):\nApplication (optional):\nPlease confirm sample availability and pricing.`,
    integration: `I am considering ${name} for an OEM design.\nHost system or target interface (if known):\nApplication or integration question:\nPlease advise on product selection and available integration resources.`
  };
  message.value = templates[intent];
  // Only maintained product/intent values enter the form. Never submit, persist,
  // log visitor input, or copy arbitrary query/hash data into the payload.
})();
