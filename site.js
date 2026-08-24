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
            <h2 id="product-family-ics"><a href="/products/interface-ics/">Interface ICs</a></h2>
            <p>CAN FD &amp; serial interface ICs</p>
          </div>
          <div class="product-mega-links">
            <a href="/products/interface-ics/#xl1326">
              <span>6 Serial + 2 CAN FD</span>
              <strong>XL1326</strong>
              <small>Mixed-interface channel configuration</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/products/interface-ics/#xl1108">
              <span>8 Serial</span>
              <strong>XL1108</strong>
              <small>Multi-channel serial configuration</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/products/interface-ics/#xl1220">
              <span>2 CAN FD</span>
              <strong>XL1220</strong>
              <small>Dual-channel CAN FD configuration</small>
              <b aria-hidden="true">→</b>
            </a>
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

  const solutionsMenuMarkup = `
    <div class="container solutions-mega-menu-inner">
      <div class="product-mega-menu-intro">
        <span>SOLUTIONS</span>
        <strong>Start with the system problem.</strong>
        <a href="/solutions/">View all solutions <b aria-hidden="true">→</b></a>
      </div>
      <div class="solutions-mega-content">
        <div class="solutions-mega-heading">
          <span>EMBEDDED CONNECTIVITY</span>
          <h2>Choose your expansion path.</h2>
          <p>Match the host connection and field interfaces to the machine you are building.</p>
        </div>
        <div class="solutions-mega-links">
          <a href="/solutions/#embedded-can-fd-expansion">
            <span>Embedded CAN FD Expansion</span>
            <strong>Need CAN FD inside an embedded PC?</strong>
            <small>Add two isolated CAN/CAN FD channels through Mini PCIe.</small>
            <em>Dual Mini PCIe CAN FD</em>
            <b aria-hidden="true">→</b>
          </a>
          <a href="/solutions/#can-fd-serial-expansion">
            <span>CAN FD + Serial Port Expansion</span>
            <strong>Need CAN FD and serial ports in one machine?</strong>
            <small>Consolidate CAN FD, RS-485, and RS-232 behind one internal USB connection.</small>
            <em>8Hub Embedded</em>
            <b aria-hidden="true">→</b>
          </a>
        </div>
      </div>
    </div>`;

  const menuDefinitions = [
    { key: "products", path: "/products", label: "Product menu", markup: productMenuMarkup },
    { key: "solutions", path: "/solutions", label: "Solutions menu", markup: solutionsMenuMarkup },
  ];

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

    const entries = menuDefinitions.flatMap((definition) => {
      const trigger = Array.from(navigation.querySelectorAll(":scope > a")).find((link) => {
        const path = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "");
        return path === definition.path;
      });
      if (!trigger) return [];

      const panelId = `${definition.key}-mega-menu-${index + 1}`;
      const panel = document.createElement("nav");
      panel.className = `site-mega-menu site-mega-menu-${definition.key}`;
      panel.id = panelId;
      panel.setAttribute("aria-label", definition.label);
      panel.setAttribute("aria-hidden", "true");
      panel.inert = true;
      panel.innerHTML = definition.markup;
      header.appendChild(panel);

      trigger.classList.add("mega-menu-trigger");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", panelId);

      return [{ ...definition, trigger, panel }];
    });

    let activeEntry = null;
    let closeMegaMenuTimer;
    let megaMenuScrim;
    let restoringMegaMenuFocus = false;

    const closeMegaMenu = ({ restoreFocus = false } = {}) => {
      window.clearTimeout(closeMegaMenuTimer);
      const entryToClose = activeEntry;
      activeEntry = null;
      header.classList.remove("is-mega-menu-open");
      entries.forEach((entry) => {
        entry.trigger.setAttribute("aria-expanded", "false");
        entry.panel.setAttribute("aria-hidden", "true");
        entry.panel.inert = true;
      });
      megaMenuScrim?.setAttribute("aria-hidden", "true");
      if (restoreFocus && entryToClose) {
        restoringMegaMenuFocus = true;
        entryToClose.trigger.focus({ preventScroll: true });
        restoringMegaMenuFocus = false;
      }
    };

    const openMegaMenu = (entry) => {
      if (!desktopNavigation.matches || !entry) return;
      window.clearTimeout(closeMegaMenuTimer);
      entries.forEach((candidate) => {
        const open = candidate === entry;
        candidate.trigger.setAttribute("aria-expanded", String(open));
        candidate.panel.setAttribute("aria-hidden", String(!open));
        candidate.panel.inert = !open;
      });
      activeEntry = entry;
      header.classList.add("is-mega-menu-open");
      megaMenuScrim?.setAttribute("aria-hidden", "false");
    };

    const queueMegaMenuClose = () => {
      window.clearTimeout(closeMegaMenuTimer);
      closeMegaMenuTimer = window.setTimeout(() => {
        const focusInside = activeEntry && (
          document.activeElement === activeEntry.trigger || activeEntry.panel.contains(document.activeElement)
        );
        if (!focusInside) closeMegaMenu();
      }, 180);
    };

    if (entries.length) {
      megaMenuScrim = document.createElement("button");
      megaMenuScrim.className = "site-mega-scrim";
      megaMenuScrim.type = "button";
      megaMenuScrim.tabIndex = -1;
      megaMenuScrim.setAttribute("aria-label", "Close navigation menu");
      megaMenuScrim.setAttribute("aria-hidden", "true");
      megaMenuScrim.addEventListener("click", () => closeMegaMenu({ restoreFocus: true }));
      megaMenuScrim.addEventListener("mouseenter", queueMegaMenuClose);
      header.insertBefore(megaMenuScrim, entries[0].panel);

      entries.forEach((entry) => {
        entry.trigger.addEventListener("mouseenter", () => openMegaMenu(entry));
        entry.trigger.addEventListener("mouseleave", queueMegaMenuClose);
        entry.panel.addEventListener("mouseenter", () => openMegaMenu(entry));
        entry.panel.addEventListener("mouseleave", queueMegaMenuClose);
        entry.trigger.addEventListener("focus", () => {
          if (!restoringMegaMenuFocus) openMegaMenu(entry);
        });
        entry.panel.addEventListener("focusin", () => openMegaMenu(entry));
        entry.trigger.addEventListener("keydown", (event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          openMegaMenu(entry);
          const firstContentLink = entry.panel.querySelector(".product-mega-links a, .solutions-mega-links a");
          (firstContentLink || entry.panel.querySelector("a"))?.focus();
        });
      });

      header.addEventListener("focusin", (event) => {
        if (!activeEntry) return;
        if (event.target !== activeEntry.trigger && !activeEntry.panel.contains(event.target)) {
          closeMegaMenu();
        }
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
        closeMegaMenu();
      }
    });

    document.addEventListener("focusin", (event) => {
      if (activeEntry && !header.contains(event.target)) closeMegaMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeEntry) {
        closeMegaMenu({ restoreFocus: true });
        return;
      }
      if (event.key === "Escape" && header.classList.contains("is-menu-open")) {
        closeMenu();
        button.focus();
      }
    });

    const handleViewport = () => {
      if (desktopNavigation.matches) {
        entries.forEach((entry) => {
          entry.trigger.setAttribute("aria-expanded", "false");
          entry.trigger.setAttribute("aria-controls", entry.panel.id);
        });
        closeMenu();
      } else {
        closeMegaMenu();
        entries.forEach((entry) => {
          entry.trigger.removeAttribute("aria-expanded");
          entry.trigger.removeAttribute("aria-controls");
        });
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

(() => {
  document.querySelectorAll("[data-production-toggle]").forEach((button) => {
    const frame = button.closest(".ic-production-video-frame");
    const video = frame && frame.querySelector("video");
    if (!video) return;

    const icon = button.querySelector("[data-production-icon]");
    const label = button.querySelector("[data-production-label]");
    const sync = () => {
      const paused = video.paused;
      if (icon) icon.textContent = paused ? "▶" : "Ⅱ";
      if (label) label.textContent = paused ? "Play film" : "Pause film";
      button.setAttribute("aria-label", paused ? "Play production film" : "Pause production film");
    };

    button.addEventListener("click", () => {
      if (video.paused) video.play().catch(sync);
      else video.pause();
    });
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    sync();
  });
})();
