(() => {
  const headers = document.querySelectorAll(".site-header");
  const desktopNavigation = window.matchMedia("(min-width: 901px)");

  const productMenuMarkup = `
    <div class="container product-mega-menu-inner">
      <div class="product-mega-menu-intro">
        <span>PRODUCT FAMILIES</span>
        <strong>Hardware for connected systems.</strong>
        <a href="/products/">View all products <b aria-hidden="true">→</b></a>
      </div>
      <div class="product-mega-menu-groups">
        <section class="product-mega-group" aria-labelledby="product-family-embedded">
          <div class="product-mega-group-heading">
            <small>01</small>
            <h2 id="product-family-embedded">Embedded Communication</h2>
            <p>Internal interface modules</p>
          </div>
          <div class="product-mega-links">
            <a href="/products/mini-pcie-dual-can-fd/">
              <span>CAN FD Modules</span>
              <strong>Dual Mini PCIe CAN FD</strong>
              <small>Two isolated internal CAN FD channels</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/products/8hub-embedded/">
              <span>CAN FD + Serial Modules</span>
              <strong>8Hub Embedded</strong>
              <small>2 CAN FD + 6 serial ports via internal USB</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-diagnostic">
          <div class="product-mega-group-heading">
            <small>02</small>
            <h2 id="product-family-diagnostic">Test &amp; Diagnostic Interfaces</h2>
            <p>Portable bus interfaces</p>
          </div>
          <div class="product-mega-links">
            <a href="/products/8hub/">
              <span>CAN FD + Serial Diagnostic Interface</span>
              <strong>Xilume 8Hub</strong>
              <small>Portable access to CAN FD, RS-485, and RS-232</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-ics">
          <div class="product-mega-group-heading">
            <small>03</small>
            <h2 id="product-family-ics">Interface ICs</h2>
            <p>CAN FD &amp; serial controllers</p>
          </div>
          <div class="product-mega-links">
            <div class="product-mega-product product-mega-product-planned">
              <span>Dual CAN FD + 6-UART Controller</span>
              <strong>XL1326</strong>
              <small>Product page in development</small>
              <em>IN DEVELOPMENT</em>
            </div>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-power">
          <div class="product-mega-group-heading">
            <small>04</small>
            <h2 id="product-family-power">Power Management</h2>
            <p>Battery management</p>
          </div>
          <div class="product-mega-links">
            <a href="/products/usb-smbus/">
              <span>Smart-Battery Status</span>
              <strong>Battery Display Module</strong>
              <small>Battery data and native status for Windows and Linux</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
      </div>
    </div>`;

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

    const productsLink = Array.from(navigation.querySelectorAll(":scope > a")).find((link) => {
      const path = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "");
      return path === "/products";
    });

    let productMenu;
    let productMenuScrim;
    let closeProductMenuTimer;

    const closeProductMenu = ({ restoreFocus = false } = {}) => {
      window.clearTimeout(closeProductMenuTimer);
      if (restoreFocus) productsLink?.focus({ preventScroll: true });
      header.classList.remove("is-product-menu-open");
      productsLink?.setAttribute("aria-expanded", "false");
      productMenu?.setAttribute("aria-hidden", "true");
      if (productMenu) productMenu.inert = true;
    };

    const openProductMenu = () => {
      if (!desktopNavigation.matches || !productsLink || !productMenu) return;
      window.clearTimeout(closeProductMenuTimer);
      header.classList.add("is-product-menu-open");
      productsLink.setAttribute("aria-expanded", "true");
      productMenu.setAttribute("aria-hidden", "false");
      productMenu.inert = false;
    };

    const queueProductMenuClose = () => {
      window.clearTimeout(closeProductMenuTimer);
      closeProductMenuTimer = window.setTimeout(() => {
        const focusedInProductMenu = document.activeElement === productsLink || productMenu?.contains(document.activeElement);
        if (!focusedInProductMenu) closeProductMenu();
      }, 180);
    };

    if (productsLink) {
      const productMenuId = `product-mega-menu-${index + 1}`;
      productsLink.classList.add("product-menu-trigger");
      productsLink.setAttribute("aria-expanded", "false");
      productsLink.setAttribute("aria-controls", productMenuId);

      productMenu = document.createElement("nav");
      productMenu.className = "product-mega-menu";
      productMenu.id = productMenuId;
      productMenu.setAttribute("aria-label", "Product menu");
      productMenu.setAttribute("aria-hidden", "true");
      productMenu.inert = true;
      productMenu.innerHTML = productMenuMarkup;
      header.appendChild(productMenu);

      productMenuScrim = document.createElement("button");
      productMenuScrim.className = "product-mega-scrim";
      productMenuScrim.type = "button";
      productMenuScrim.tabIndex = -1;
      productMenuScrim.setAttribute("aria-label", "Close product menu");
      productMenuScrim.addEventListener("click", () => closeProductMenu({ restoreFocus: true }));
      productMenuScrim.addEventListener("mouseenter", queueProductMenuClose);
      header.insertBefore(productMenuScrim, productMenu);

      productsLink.addEventListener("mouseenter", openProductMenu);
      productsLink.addEventListener("mouseleave", queueProductMenuClose);
      productMenu.addEventListener("mouseenter", openProductMenu);
      productMenu.addEventListener("mouseleave", queueProductMenuClose);

      productsLink.addEventListener("focus", openProductMenu);
      productMenu.addEventListener("focusin", openProductMenu);
      header.addEventListener("focusin", (event) => {
        if (event.target !== productsLink && !productMenu.contains(event.target)) {
          closeProductMenu();
        }
      });

      productsLink.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown") return;
        event.preventDefault();
        openProductMenu();
        productMenu.querySelector(".product-mega-links a")?.focus();
      });
    }

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
      if (!header.contains(event.target)) {
        closeMenu();
        closeProductMenu();
      }
    });

    document.addEventListener("focusin", (event) => {
      if (header.classList.contains("is-product-menu-open") && !header.contains(event.target)) {
        closeProductMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("is-product-menu-open")) {
        closeProductMenu({ restoreFocus: true });
        return;
      }
      if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
        closeMenu();
        button.focus();
      }
    });

    const handleViewport = () => {
      if (desktopNavigation.matches) {
        if (productsLink) {
          productsLink.setAttribute("aria-expanded", "false");
          productsLink.setAttribute("aria-controls", productMenu?.id || "");
        }
        closeMenu();
      } else {
        closeProductMenu();
        productsLink?.removeAttribute("aria-expanded");
        productsLink?.removeAttribute("aria-controls");
      }
    };

    if (typeof desktopNavigation.addEventListener === "function") {
      desktopNavigation.addEventListener("change", handleViewport);
    } else {
      desktopNavigation.addListener(handleViewport);
    }

    handleViewport();
  });
})();
