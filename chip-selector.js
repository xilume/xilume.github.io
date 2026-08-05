(() => {
  const finder = document.querySelector("[data-chip-finder]");
  if (!finder) return;

  const buttons = Array.from(finder.querySelectorAll("[data-chip-filter]"));
  const cards = Array.from(finder.querySelectorAll("[data-chip-card]"));
  const note = finder.querySelector("[data-chip-result-note]");

  const labels = {
    all: "Showing all four Xilume controllers.",
    canfd: "Best match: LX32F27 for two CAN / CAN FD networks.",
    can: "Best match: LX32C22 for two Classic CAN networks.",
    multi: "Best match: LX88U48 for eight industrial interface channels.",
    battery: "Best match: LX42P12 for battery and native power status."
  };

  const selectFilter = (filter, updateHash = false) => {
    const validFilter = Object.prototype.hasOwnProperty.call(labels, filter) ? filter : "all";

    buttons.forEach((button) => {
      const active = button.dataset.chipFilter === validFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    cards.forEach((card) => {
      const visible = validFilter === "all" || card.dataset.category === validFilter;
      card.hidden = !visible;
      card.classList.toggle("is-recommended", visible && validFilter !== "all");
      card.classList.remove("is-targeted");
    });

    if (note) note.textContent = labels[validFilter];
    finder.dataset.activeFilter = validFilter;

    if (updateHash) {
      const nextHash = validFilter === "all" ? "#choose" : `#${validFilter}`;
      window.history.replaceState(null, "", nextHash);
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectFilter(button.dataset.chipFilter, true));
  });

  const initialHash = window.location.hash.slice(1).toLowerCase();
  const directCard = cards.find((card) => card.id.toLowerCase() === initialHash);

  if (directCard) {
    selectFilter(directCard.dataset.category);
    directCard.classList.add("is-targeted");
    window.requestAnimationFrame(() => directCard.scrollIntoView({ block: "center", behavior: "smooth" }));
  } else if (Object.prototype.hasOwnProperty.call(labels, initialHash)) {
    selectFilter(initialHash);
  } else {
    selectFilter("all");
  }
})();
