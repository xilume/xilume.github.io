(() => {
  const finder = document.querySelector("[data-chip-finder]");
  if (!finder) return;

  const buttons = Array.from(finder.querySelectorAll("[data-chip-filter]"));
  const cards = Array.from(finder.querySelectorAll("[data-chip-card]"));
  const note = finder.querySelector("[data-chip-result-note]");
  const isSimplifiedChinese = document.documentElement.lang.toLowerCase().startsWith("zh");
  const labels = isSimplifiedChinese ? {
    all: "浏览 XL 接口芯片产品组合。",
    canfd: "CAN FD 接口芯片",
    can: "CAN 接口芯片",
    multi: "混合接口芯片",
    battery: "电池与电源产品"
  } : {
    all: "Browse the XL interface IC portfolio.",
    canfd: "CAN FD interface ICs",
    can: "CAN interface ICs",
    multi: "Mixed-interface ICs",
    battery: "Battery and power products"
  };

  const selectFilter = (filter, updateHash = false) => {
    const selected = Object.prototype.hasOwnProperty.call(labels, filter) ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.chipFilter === selected;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    cards.forEach((card) => {
      const visible = selected === "all" || card.dataset.category === selected;
      card.hidden = !visible;
      card.classList.toggle("is-recommended", visible && selected !== "all");
    });

    if (note) note.textContent = labels[selected];
    if (updateHash) window.history.replaceState(null, "", selected === "all" ? "#choose" : `#${selected}`);
  };

  buttons.forEach((button) => button.addEventListener("click", () => selectFilter(button.dataset.chipFilter, true)));

  const hash = window.location.hash.slice(1).toLowerCase();
  const directCard = cards.find((card) => card.id.toLowerCase() === hash);
  if (directCard) {
    selectFilter(directCard.dataset.category);
    directCard.classList.add("is-targeted");
    window.requestAnimationFrame(() => directCard.scrollIntoView({ block: "center", behavior: "smooth" }));
  } else {
    selectFilter(hash);
  }
})();
