(() => {
  const image = document.querySelector('[data-why-image]');
  if (!image) return;

  const sources = [
    '../../images/8hub-embedded-why-final-00.b64.txt?v=20260818-10',
    '../../images/8hub-embedded-why-final-01.b64.txt?v=20260818-10',
    '../../images/8hub-embedded-why-final-02.b64.txt?v=20260818-10',
    '../../images/8hub-embedded-why-final-03.b64.txt?v=20260818-10'
  ];

  Promise.all(sources.map((url) =>
    fetch(url, { cache: 'force-cache' }).then((response) => {
      if (!response.ok) throw new Error(`Unable to load ${url}`);
      return response.text();
    })
  ))
    .then((chunks) => {
      const base64 = chunks.join('').replace(/\s+/g, '');
      const finalImage = new Image();
      finalImage.onload = () => {
        image.src = finalImage.src;
        image.classList.add('is-loaded');
      };
      finalImage.onerror = () => image.classList.add('is-fallback');
      finalImage.src = `data:image/webp;base64,${base64}`;
    })
    .catch(() => image.classList.add('is-fallback'));
})();
