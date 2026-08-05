(() => {
  const finder = document.querySelector("[data-chip-finder]");
  if (!finder) return;

  const buttons = Array.from(finder.querySelectorAll("[data-chip-filter]"));
  const cards = Array.from(finder.querySelectorAll("[data-chip-card]"));
  const note = finder.querySelector("[data-chip-result-note]");
  const labels = {
    all: "Browse the LX series.",
    canfd: "CAN FD controllers",
    can: "Classic CAN controllers",
    multi: "Multi-interface controllers",
    battery: "Battery and power controllers"
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
