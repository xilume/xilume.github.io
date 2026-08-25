(() => {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;
  const isSimplifiedChinese = document.documentElement.lang.toLowerCase().startsWith("zh");

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const tabs = Array.from(carousel.querySelectorAll("[data-hero-select]"));
  const selector = carousel.querySelector(".product-hero-selector");
  const previousButton = carousel.querySelector("[data-hero-previous]");
  const nextButton = carousel.querySelector("[data-hero-next]");
  const autoplayButton = carousel.querySelector("[data-hero-autoplay]");
  const autoplayIcon = carousel.querySelector("[data-hero-autoplay-icon]");
  const autoplayLabel = carousel.querySelector("[data-hero-autoplay-label]");
  const status = carousel.querySelector("[data-hero-status]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = 3000;

  let activeIndex = 0;
  let timer = null;
  let interactionPaused = false;
  let userPaused = false;
  let transitionRequest = 0;
  const slideReadyPromises = new Map();
  const failedSlides = new Set();

  const normalizedIndex = (index) => (index + slides.length) % slides.length;

  const prepareImage = (image) => {
    if (image.dataset.heroSrcset && !image.hasAttribute("srcset")) {
      image.srcset = image.dataset.heroSrcset;
    }

    if (image.dataset.heroSrc && !image.hasAttribute("src")) {
      image.src = image.dataset.heroSrc;
    }

    image.loading = "eager";

    const waitForLoad = image.complete
      ? Promise.resolve(image.naturalWidth > 0)
      : new Promise((resolve) => {
          image.addEventListener("load", () => resolve(true), { once: true });
          image.addEventListener("error", () => resolve(false), { once: true });
        });

    return waitForLoad.then((loaded) => {
      if (!loaded || !image.naturalWidth) return false;
      if (typeof image.decode !== "function") return true;
      return image.decode().then(() => true).catch(() => image.naturalWidth > 0);
    });
  };

  const prepareSlide = (requestedIndex) => {
    const index = normalizedIndex(requestedIndex);
    if (slideReadyPromises.has(index)) return slideReadyPromises.get(index);

    const slide = slides[index];
    const ready = Promise.all(Array.from(slide.querySelectorAll("img")).map(prepareImage))
      .then((results) => {
        const succeeded = results.every(Boolean);
        slide.classList.toggle("is-image-ready", succeeded);
        slide.classList.toggle("is-image-failed", !succeeded);
        if (succeeded) {
          failedSlides.delete(index);
        } else {
          failedSlides.add(index);
          slide.querySelectorAll("img").forEach((image) => {
            if (image.naturalWidth) return;
            image.removeAttribute("src");
            if (image.dataset.heroSrcset) image.removeAttribute("srcset");
          });
          slideReadyPromises.delete(index);
        }
        return succeeded;
      });

    slideReadyPromises.set(index, ready);
    return ready;
  };

  slides.forEach((slide, index) => {
    slide.id = `featured-product-${index + 1}`;
  });

  tabs.forEach((tab, index) => {
    tab.id = `featured-product-tab-${index + 1}`;
    tab.setAttribute("aria-controls", slides[index].id);
    tab.setAttribute("aria-label", slides[index].getAttribute("aria-label") || (isSimplifiedChinese ? `精选产品 ${index + 1}` : `Featured product ${index + 1}`));
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

  const canAutoplay = () => !reducedMotion.matches && !interactionPaused && !userPaused && !document.hidden;

  const nextAvailableIndex = (requestedIndex, direction = 1) => {
    let index = normalizedIndex(requestedIndex);
    for (let checked = 0; checked < slides.length; checked += 1) {
      if (!failedSlides.has(index)) return index;
      index = normalizedIndex(index + direction);
    }
    return activeIndex;
  };

  const updateAutoplayButton = () => {
    if (!autoplayButton) return;
    if (reducedMotion.matches) {
      autoplayButton.disabled = true;
      autoplayButton.setAttribute("aria-pressed", "true");
      autoplayButton.setAttribute("aria-label", isSimplifiedChinese ? "已根据减少动态效果偏好关闭产品自动轮播" : "Automatic product rotation disabled by reduced-motion preference");
      if (autoplayIcon) autoplayIcon.textContent = "—";
      if (autoplayLabel) autoplayLabel.textContent = isSimplifiedChinese ? "动态已关闭" : "Motion off";
      return;
    }
    autoplayButton.disabled = false;
    autoplayButton.setAttribute("aria-pressed", String(userPaused));
    autoplayButton.setAttribute("aria-label", isSimplifiedChinese ? (userPaused ? "继续自动轮播产品" : "暂停自动轮播产品") : (userPaused ? "Resume automatic product rotation" : "Pause automatic product rotation"));
    if (autoplayIcon) autoplayIcon.textContent = userPaused ? "▶" : "Ⅱ";
    if (autoplayLabel) autoplayLabel.textContent = isSimplifiedChinese ? (userPaused ? "播放" : "暂停") : (userPaused ? "Play" : "Pause");
  };

  const scheduleNext = () => {
    clearTimer();
    if (!canAutoplay()) return;
    carousel.classList.remove("is-paused");
    restartProgress();
    const nextIndex = nextAvailableIndex(activeIndex + 1);
    void prepareSlide(nextIndex);
    timer = window.setTimeout(() => {
      void showSlide(nextIndex, false);
    }, interval);
  };

  const showSlide = async (requestedIndex, announce) => {
    const targetIndex = normalizedIndex(requestedIndex);
    const requestId = ++transitionRequest;
    clearTimer();
    carousel.classList.add("is-preparing-slide");

    const imageReady = await prepareSlide(targetIndex);
    if (requestId !== transitionRequest) return;

    if (!imageReady) {
      carousel.classList.remove("is-preparing-slide");
      if (announce && status) status.textContent = isSimplifiedChinese ? "该产品图片暂时无法显示。" : "This product image is temporarily unavailable.";
      if (canAutoplay()) {
        const fallbackIndex = nextAvailableIndex(targetIndex + 1);
        if (fallbackIndex !== activeIndex) {
          void showSlide(fallbackIndex, false);
          return;
        }
      }
      scheduleNext();
      return;
    }

    activeIndex = targetIndex;
    carousel.classList.remove("is-preparing-slide");

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

    if (announce) {
      tabs[activeIndex]?.scrollIntoView?.({ behavior: !reducedMotion.matches ? "smooth" : "auto", block: "nearest", inline: "nearest" });
    }

    if (announce && status) {
      status.textContent = slides[activeIndex].getAttribute("aria-label") || (isSimplifiedChinese ? `精选产品 ${activeIndex + 1}` : `Featured product ${activeIndex + 1}`);
    }

    scheduleNext();
  };

  const pause = () => {
    interactionPaused = true;
    transitionRequest += 1;
    carousel.classList.add("is-paused");
    carousel.classList.remove("is-preparing-slide");
    clearTimer();
  };

  const resume = () => {
    interactionPaused = false;
    scheduleNext();
  };

  previousButton?.addEventListener("click", () => void showSlide(activeIndex - 1, true));
  nextButton?.addEventListener("click", () => void showSlide(activeIndex + 1, true));
  autoplayButton?.addEventListener("click", () => {
    userPaused = !userPaused;
    updateAutoplayButton();
    if (userPaused) {
      transitionRequest += 1;
      carousel.classList.add("is-paused");
      carousel.classList.remove("is-preparing-slide");
      clearTimer();
    } else {
      interactionPaused = false;
      scheduleNext();
    }
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => void showSlide(index, true));
    tab.addEventListener("pointerenter", () => void prepareSlide(index));
    tab.addEventListener("focus", () => void prepareSlide(index));
  });

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", resume);
  carousel.addEventListener("focusin", (event) => {
    if (!event.target.closest?.("[data-hero-autoplay]")) pause();
  });
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) resume();
  });

  selector?.addEventListener("keydown", (event) => {
    const focusedIndex = tabs.indexOf(document.activeElement);
    const navigationIndex = focusedIndex >= 0 ? focusedIndex : activeIndex;
    let requestedIndex = null;
    if (event.key === "ArrowLeft") requestedIndex = navigationIndex - 1;
    if (event.key === "ArrowRight") requestedIndex = navigationIndex + 1;
    if (event.key === "Home") requestedIndex = 0;
    if (event.key === "End") requestedIndex = slides.length - 1;
    if (requestedIndex === null) return;
    event.preventDefault();
    void showSlide(requestedIndex, true).then(() => tabs[activeIndex]?.focus());
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      transitionRequest += 1;
      carousel.classList.add("is-paused");
      carousel.classList.remove("is-preparing-slide");
      clearTimer();
    } else {
      scheduleNext();
    }
  });

  const handleMotionPreference = () => {
    carousel.classList.toggle("is-reduced-motion", reducedMotion.matches);
    updateAutoplayButton();
    if (reducedMotion.matches) {
      transitionRequest += 1;
      clearTimer();
      carousel.classList.add("is-paused");
      carousel.classList.remove("is-preparing-slide");
    } else {
      scheduleNext();
    }
  };

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleMotionPreference);
  } else {
    reducedMotion.addListener(handleMotionPreference);
  }

  updateAutoplayButton();
  void showSlide(activeIndex, false);
})();

(() => {
  const groups = [
    document.querySelector(".home-category-panels"),
    document.querySelector(".home-solution-grid"),
  ].filter(Boolean);

  if (!groups.length) return;
  groups.forEach((group) => group.classList.add("is-managed-images"));

  const decodeImage = (image) => {
    image.loading = "eager";
    image.fetchPriority = "low";

    const loaded = image.complete
      ? Promise.resolve(image.naturalWidth > 0)
      : new Promise((resolve) => {
          image.addEventListener("load", () => resolve(true), { once: true });
          image.addEventListener("error", () => resolve(false), { once: true });
        });

    return loaded.then((succeeded) => {
      if (!succeeded || !image.naturalWidth) {
        image.classList.add("is-image-failed");
        return false;
      }
      if (typeof image.decode !== "function") return true;
      return image.decode().then(() => true).catch(() => image.naturalWidth > 0);
    });
  };

  const prepareGroup = (group) => {
    if (group.dataset.imagesPrepared === "true") return;
    group.dataset.imagesPrepared = "true";
    group.classList.add("is-loading-images");

    const images = Array.from(group.querySelectorAll("img[data-deferred-image]"));
    Promise.all(images.map(decodeImage)).then(() => {
      group.classList.remove("is-loading-images");
      group.classList.add("is-images-ready");
    });
  };

  if (!("IntersectionObserver" in window)) {
    groups.forEach(prepareGroup);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      prepareGroup(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "700px 0px" });

  groups.forEach((group) => observer.observe(group));
})();
