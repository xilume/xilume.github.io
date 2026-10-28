(() => {
  'use strict';

  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const status = form.querySelector('[data-contact-status]');
  const chinese = document.documentElement.lang.toLowerCase().startsWith('zh');
  const copy = chinese ? {
    continuing: '请在下一页完成验证与提交',
    error: '暂时无法提交，请稍后重试，或发邮件至 contact@xilume.co',
    copied: '已复制 contact@xilume.co',
    copyFailed: '无法自动复制，请选中上方 contact@xilume.co 手动复制',
    invalidEmail: '请填写可接收回复的邮箱',
    invalidMessage: '简单写下你的问题即可，例如想了解哪款产品的价格'
  } : {
    continuing: 'Please complete verification and submission on the next page.',
    error: 'Please try again later or email contact@xilume.co.',
    copied: 'Copied contact@xilume.co',
    copyFailed: 'Could not copy. Select contact@xilume.co above and copy it manually.',
    invalidEmail: 'Enter an email address where we can reply.',
    invalidMessage: 'A short question is enough, such as which product you would like pricing for.'
  };

  const copyButton = document.querySelector('[data-contact-copy-email]');
  const copyStatus = document.querySelector('[data-contact-copy-status]');
  if (copyButton && copyStatus) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      try {
        const clipboard = window.navigator && window.navigator.clipboard;
        if (!clipboard || typeof clipboard.writeText !== 'function') throw new Error('Clipboard unavailable');
        await clipboard.writeText('contact@xilume.co');
        copyStatus.textContent = copy.copied;
      } catch (_) {
        copyStatus.textContent = copy.copyFailed;
      }
    });
  }

  const email = form.elements.namedItem('email');
  const name = form.elements.namedItem('name');
  const message = form.elements.namedItem('message');
  const honey = form.elements.namedItem('_honey');
  if (!email || !message) return;

  function announce(text, state) {
    if (!status) return;
    status.textContent = text;
    status.dataset.state = state;
    status.hidden = false;
  }

  [email, message].forEach(field => {
    field.addEventListener('input', () => field.setCustomValidity(''));
  });

  form.addEventListener('submit', event => {
    email.value = email.value.trim();
    if (name) name.value = name.value.trim();
    message.value = message.value.trim();
    email.setCustomValidity(email.value ? '' : copy.invalidEmail);
    message.setCustomValidity(message.value ? '' : copy.invalidMessage);
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    if (honey && honey.value) {
      event.preventDefault();
      announce(copy.error, 'error');
      return;
    }

    // FormSubmit autoresponses require native POST and enabled reCAPTCHA.
    // Let the browser navigate; do not fetch, reset inputs, or claim delivery.
    announce(copy.continuing, 'sending');
  });
})();
