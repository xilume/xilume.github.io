(() => {
  const catalog = document.querySelector("[data-download-catalog]");
  if (!catalog) return;

  const cards = Array.from(catalog.querySelectorAll("[data-download-card]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-filter-group][data-filter-value]"));
  const searchInput = document.querySelector("[data-download-search]");
  const resultCount = document.querySelector("[data-download-result-count]");
  const emptyState = document.querySelector("[data-download-empty]");
  const isChinese = document.documentElement.lang.toLowerCase().startsWith("zh");
  const filters = { product: "all", os: "all" };
  const queryParameters = new URLSearchParams(window.location.search);

  ["product", "os"].forEach((key) => {
    const requested = queryParameters.get(key);
    const matchingButton = filterButtons.find((button) => button.dataset.filterGroup === key && button.dataset.filterValue === requested);
    if (!matchingButton) return;
    filters[key] = requested;
    filterButtons
      .filter((button) => button.dataset.filterGroup === key)
      .forEach((button) => button.setAttribute("aria-pressed", String(button === matchingButton)));
  });

  const normalize = (value) => (value || "").toLowerCase().trim();

  const matchesToken = (card, key, selected) => {
    if (selected === "all") return true;
    return normalize(card.dataset[key]).split(/\s+/).includes(selected);
  };

  const applyFilters = () => {
    const query = normalize(searchInput?.value);
    let visible = 0;

    cards.forEach((card) => {
      const searchableText = normalize(`${card.textContent} ${card.dataset.search || ""}`);
      const show = matchesToken(card, "product", filters.product)
        && matchesToken(card, "os", filters.os)
        && (!query || searchableText.includes(query));
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) {
      resultCount.textContent = isChinese
        ? `显示 ${visible} 个下载项目`
        : `${visible} download${visible === 1 ? "" : "s"} shown`;
    }
    if (emptyState) emptyState.hidden = visible !== 0;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.filterGroup;
      const value = button.dataset.filterValue;
      if (!(group in filters)) return;
      filters[group] = value;
      filterButtons
        .filter((option) => option.dataset.filterGroup === group)
        .forEach((option) => option.setAttribute("aria-pressed", String(option === button)));
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", applyFilters);
  applyFilters();
})();
