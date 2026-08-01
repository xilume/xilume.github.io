(() => {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const tabs = Array.from(carousel.querySelectorAll("[data-hero-select]"));
  const selector = carousel.querySelector(".product-hero-selector");
  const previousButton = carousel.querySelector("[data-hero-previous]");
  const nextButton = carousel.querySelector("[data-hero-next]");
  const status = carousel.querySelector("[data-hero-status]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = 5000;

  let activeIndex = 0;
  let timer = null;
  let interactionPaused = false;

  slides.forEach((slide, index) => {
    slide.id = `featured-product-${index + 1}`;
  });

  tabs.forEach((tab, index) => {
    tab.id = `featured-product-tab-${index + 1}`;
    tab.setAttribute("aria-controls", slides[index].id);
    tab.setAttribute("aria-label", slides[index].getAttribute("aria-label") || `Featured product ${index + 1}`);
    slides[index].setAttribute("aria-labelledby", tab.id);
  });

  const clearTimer = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const restartProgress = () => {
    const activeTab = tabs[activeIndex];
    if (!activeTab) return;
    activeTab.classList.remove("is-active");
    void activeTab.offsetWidth;
    activeTab.classList.add("is-active");
  };

  const canAutoplay = () => !reducedMotion.matches && !interactionPaused && !document.hidden;

  const scheduleNext = () => {
    clearTimer();
    if (!canAutoplay()) return;
    carousel.classList.remove("is-paused");
    restartProgress();
    timer = window.setTimeout(() => {
      showSlide(activeIndex + 1, false);
    }, interval);
  };

  const showSlide = (requestedIndex, announce) => {
    activeIndex = (requestedIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.toggleAttribute("inert", !isActive);
    });

    tabs.forEach((tab, index) => {
      const isActive = index === activeIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    if (announce && status) {
      status.textContent = slides[activeIndex].getAttribute("aria-label") || `Featured product ${activeIndex + 1}`;
    }

    scheduleNext();
  };

  const pause = () => {
    interactionPaused = true;
    carousel.classList.add("is-paused");
    clearTimer();
  };

  const resume = () => {
    interactionPaused = false;
    scheduleNext();
  };

  previousButton?.addEventListener("click", () => showSlide(activeIndex - 1, true));
  nextButton?.addEventListener("click", () => showSlide(activeIndex + 1, true));

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showSlide(index, true));
  });

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", resume);
  carousel.addEventListener("focusin", pause);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) resume();
  });

  selector?.addEventListener("keydown", (event) => {
    let requestedIndex = null;
    if (event.key === "ArrowLeft") requestedIndex = activeIndex - 1;
    if (event.key === "ArrowRight") requestedIndex = activeIndex + 1;
    if (event.key === "Home") requestedIndex = 0;
    if (event.key === "End") requestedIndex = slides.length - 1;
    if (requestedIndex === null) return;
    event.preventDefault();
    showSlide(requestedIndex, true);
    tabs[activeIndex]?.focus();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      carousel.classList.add("is-paused");
      clearTimer();
    } else {
      scheduleNext();
    }
  });

  const handleMotionPreference = () => {
    carousel.classList.toggle("is-reduced-motion", reducedMotion.matches);
    if (reducedMotion.matches) {
      clearTimer();
      carousel.classList.add("is-paused");
    } else {
      scheduleNext();
    }
  };

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleMotionPreference);
  } else {
    reducedMotion.addListener(handleMotionPreference);
  }

  showSlide(0, false);
})();
