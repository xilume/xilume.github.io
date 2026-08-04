(() => {
  const links = Array.from(document.querySelectorAll(".dcf-local-links a[href^='#']"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const setCurrent = (sectionId) => {
    links.forEach((link) => {
      const current = link.getAttribute("href") === `#${sectionId}`;
      if (current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  let frame = null;
  const update = () => {
    frame = null;
    const marker = window.innerWidth <= 900 ? 126 : 148;
    let active = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) active = section;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
      active = sections[sections.length - 1];
    }

    setCurrent(active.id);
  };

  links.forEach((link) => {
    link.addEventListener("click", () => setCurrent(link.getAttribute("href").slice(1)));
  });

  window.addEventListener("scroll", () => {
    if (frame === null) frame = window.requestAnimationFrame(update);
  }, { passive:true });

  window.addEventListener("resize", update);
  update();
})();
