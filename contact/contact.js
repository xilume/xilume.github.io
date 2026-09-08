(() => {
  'use strict';

  const form = document.querySelector('[data-contact-form]');
  if (!form || typeof window.fetch !== 'function' || typeof window.AbortController !== 'function') return;

  const button = form.querySelector('[data-contact-submit]');
  const buttonLabel = form.querySelector('[data-contact-submit-label]') || button;
  const status = form.querySelector('[data-contact-status]');
  if (!button || !status) return;

  const chinese = document.documentElement.lang.toLowerCase().startsWith('zh');
  const copy = chinese ? {
    sending: '正在发送…',
    success: '消息已提交，我们的工作人员会在一个工作日内通过邮件回复你',
    error: '暂时无法确认是否提交成功，你填写的内容已保留。请稍后重试，或发邮件至 contact@xilume.co',
    pending: '在线联系服务暂未就绪，你填写的内容已保留。请直接发邮件至 contact@xilume.co',
    invalidEmail: '请填写可接收回复的邮箱',
    invalidMessage: '简单写下你的问题即可，例如想了解哪款产品的价格'
  } : {
    sending: 'Sending…',
    success: 'Your message has been submitted. Our team will reply by email within one business day.',
    error: 'We could not confirm your submission. Your details are still here. Please try again later or email contact@xilume.co.',
    pending: 'Online contact is temporarily unavailable. Your details are still here. Please email contact@xilume.co.',
    invalidEmail: 'Enter an email address where we can reply.',
    invalidMessage: 'A short question is enough, such as which product you would like pricing for.'
  };

  const email = form.elements.namedItem('email');
  const name = form.elements.namedItem('name');
  const message = form.elements.namedItem('message');
  const honey = form.elements.namedItem('_honey');
  const idleLabel = buttonLabel.textContent;
  let sending = false;

  function announce(text, state) {
    status.textContent = text;
    status.dataset.state = state;
    status.hidden = false;
  }

  [email, message].forEach(field => {
    field.addEventListener('input', () => field.setCustomValidity(''));
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    email.value = email.value.trim();
    name.value = name.value.trim();
    message.value = message.value.trim();
    email.setCustomValidity(email.value ? '' : copy.invalidEmail);
    message.setCustomValidity(message.value ? '' : copy.invalidMessage);
    if (!form.reportValidity()) return;
    if (honey && honey.value) {
      announce(copy.error, 'error');
      return;
    }

    const topic = form.elements.namedItem('topic').value || 'Pricing';
    // Keep the destination and source URL fixed: never send a visitor's query string.
    const payload = {
      email: email.value,
      name: name.value,
      message: message.value,
      topic,
      language: chinese ? 'zh-CN' : 'en',
      _subject: `Xilume website inquiry — ${chinese ? '中文' : 'English'}`,
      _url: chinese ? 'https://xilume.co/zh-cn/contact/' : 'https://xilume.co/contact/',
      _template: 'table',
      _honey: ''
    };

    sending = true;
    button.disabled = true;
    buttonLabel.textContent = copy.sending;
    form.setAttribute('aria-busy', 'true');
    announce(copy.sending, 'sending');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await window.fetch('https://formsubmit.co/ajax/contact@xilume.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'omit',
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      const providerMessage = typeof result?.message === 'string' ? result.message : '';
      const pending = /activat|verif|confirm/i.test(providerMessage);
      if (pending) {
        announce(copy.pending, 'error');
        return;
      }
      if (!response.ok || (result?.success !== true && result?.success !== 'true')) throw new Error('Submission not acknowledged');

      // Do not discard changes made while the request was in flight.
      if (email.value === payload.email && name.value === payload.name && message.value === payload.message && form.elements.namedItem('topic').value === topic) {
        form.reset();
      }
      announce(copy.success, 'success');
    } catch {
      // A timeout can happen after acceptance; never retry automatically or claim delivery.
      announce(copy.error, 'error');
    } finally {
      window.clearTimeout(timer);
      sending = false;
      button.disabled = false;
      buttonLabel.textContent = idleLabel;
      form.removeAttribute('aria-busy');
    }
  });
})();
