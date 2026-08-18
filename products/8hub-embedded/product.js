// Xilume 8Hub Embedded Why visual loader v8
(() => {
  const image = document.querySelector('[data-why-image]');
  if (!image) return;

  const sources = Array.from({ length: 12 }, (_, index) =>
    `../../images/8hub-embedded-why-b64-${String(index).padStart(2, '0')}.txt?v=20260818-8`
  );

  Promise.all(
    sources.map((url) =>
      fetch(url, { cache: 'force-cache' }).then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${url}`);
        return response.text();
      })
    )
  )
    .then((chunks) => {
      const base64 = chunks.join('').replace(/\s+/g, '');
      image.src = `data:image/webp;base64,${base64}`;
      image.classList.add('is-loaded');
    })
    .catch(() => {
      image.classList.add('is-fallback');
    });
})();
