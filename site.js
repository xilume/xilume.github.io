(() => {
  const headers = document.querySelectorAll(".site-header");
  const desktopNavigation = window.matchMedia("(min-width: 901px)");

  headers.forEach((header, index) => {
    const inner = header.querySelector(".header-inner");
    const navigation = inner?.querySelector("nav[aria-label='Primary navigation']");
    if (!inner || !navigation) return;

    const navigationId = navigation.id || `primary-navigation-${index + 1}`;
    navigation.id = navigationId;

    const button = document.createElement("button");
    button.className = "site-menu-toggle";
    button.type = "button";
    button.setAttribute("aria-controls", navigationId);
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<span aria-hidden="true"><i></i><i></i><i></i></span><b>Menu</b>';
    inner.insertBefore(button, navigation);

    const closeMenu = () => {
      header.classList.remove("is-menu-open");
      button.setAttribute("aria-expanded", "false");
    };

    button.addEventListener("click", () => {
      const open = !header.classList.contains("is-menu-open");
      header.classList.toggle("is-menu-open", open);
      button.setAttribute("aria-expanded", String(open));
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
        closeMenu();
        button.focus();
      }
    });

    const handleViewport = () => {
      if (desktopNavigation.matches) closeMenu();
    };

    if (typeof desktopNavigation.addEventListener === "function") {
      desktopNavigation.addEventListener("change", handleViewport);
    } else {
      desktopNavigation.addListener(handleViewport);
    }
  });
})();
