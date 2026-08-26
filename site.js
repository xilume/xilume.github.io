(() => {
  const headers = document.querySelectorAll(".site-header");
  const desktopNavigation = window.matchMedia("(min-width: 901px)");
  const isSimplifiedChinese = document.documentElement.lang.toLowerCase().startsWith("zh");
  const localePrefix = isSimplifiedChinese ? "/zh-cn" : "";

  const productMenuMarkup = isSimplifiedChinese ? `
    <div class="container product-mega-menu-inner">
      <div class="product-mega-menu-intro">
        <span>产品系列</span>
        <strong>面向互联系统的专业硬件</strong>
        <a href="/zh-cn/products/">查看全部产品 <b aria-hidden="true">→</b></a>
      </div>
      <div class="product-mega-menu-groups">
        <section class="product-mega-group" aria-labelledby="product-family-embedded">
          <div class="product-mega-group-heading">
            <small>01</small>
            <h2 id="product-family-embedded">嵌入式通信</h2>
            <p>内置接口模块</p>
          </div>
          <div class="product-mega-links">
            <a href="/zh-cn/products/mini-pcie-dual-can-fd/">
              <span>CAN FD 模块</span>
              <strong>Dual Mini PCIe CAN FD</strong>
              <small>2 路隔离式内置 CAN FD 通道</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/zh-cn/products/8hub-embedded/">
              <span>嵌入式 8 通道通信模块</span>
              <strong>Xilume XE826</strong>
              <small>内置 USB 提供 2 路 CAN FD + 6 路串行接口</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-diagnostic">
          <div class="product-mega-group-heading">
            <small>02</small>
            <h2 id="product-family-diagnostic">测试与诊断接口</h2>
            <p>便携式总线接口</p>
          </div>
          <div class="product-mega-links">
            <a href="/zh-cn/products/8hub/">
              <span>桌面 8 通道通信接口</span>
              <strong>Xilume Octant</strong>
              <small>便携接入 CAN FD、RS-485 和 RS-232</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-ics">
          <div class="product-mega-group-heading">
            <small>03</small>
            <h2 id="product-family-ics"><a href="/zh-cn/products/interface-ics/">接口芯片</a></h2>
            <p>XL 系列器件与接口产品</p>
          </div>
          <div class="product-mega-links">
            <a href="/zh-cn/products/interface-ics/#family-mixed">
              <span>串行接口 + CAN FD</span>
              <strong>混合接口芯片</strong>
              <small>集成式多总线连接</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/zh-cn/products/interface-ics/#family-serial">
              <span>多通道串行接口</span>
              <strong>串行接口芯片</strong>
              <small>可扩展的串行通道集成</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/zh-cn/products/interface-ics/#family-canfd">
              <span>CAN FD</span>
              <strong>CAN FD 接口芯片</strong>
              <small>专用高速 CAN 连接</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-power">
          <div class="product-mega-group-heading">
            <small>04</small>
            <h2 id="product-family-power">电源管理</h2>
            <p>电池管理</p>
          </div>
          <div class="product-mega-links">
            <a href="/zh-cn/products/usb-smbus/">
              <span>智能电池状态</span>
              <strong>电池显示模块</strong>
              <small>为 Windows 和 Linux 提供电池数据与原生状态显示</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
      </div>
    </div>` : `
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
              <span>Embedded 8-Channel Communication Module</span>
              <strong>Xilume XE826</strong>
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
              <span>Desktop 8-Channel Communication Interface</span>
              <strong>Xilume Octant</strong>
              <small>Portable access to CAN FD, RS-485, and RS-232</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-ics">
          <div class="product-mega-group-heading">
            <small>03</small>
            <h2 id="product-family-ics"><a href="/products/interface-ics/">Interface ICs</a></h2>
            <p>Featured XL devices &amp; interface families</p>
          </div>
          <div class="product-mega-links">
            <a href="/products/interface-ics/#family-mixed">
              <span>Serial + CAN FD</span>
              <strong>Mixed-interface ICs</strong>
              <small>Integrated multi-bus connectivity</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/products/interface-ics/#family-serial">
              <span>Multi-channel serial</span>
              <strong>Serial interface ICs</strong>
              <small>Scalable serial channel integration</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/products/interface-ics/#family-canfd">
              <span>CAN FD</span>
              <strong>CAN FD interface ICs</strong>
              <small>Dedicated high-speed CAN connectivity</small>
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

  const solutionsMenuMarkup = isSimplifiedChinese ? `
    <div class="container solutions-mega-menu-inner">
      <div class="product-mega-menu-intro">
        <span>解决方案</span>
        <strong>从系统问题出发</strong>
        <a href="/zh-cn/solutions/">查看全部解决方案 <b aria-hidden="true">→</b></a>
      </div>
      <div class="solutions-mega-content">
        <div class="solutions-mega-heading">
          <span>嵌入式连接</span>
          <h2>选择合适的扩展路径</h2>
          <p>根据主机连接、现场接口和设备形态，为系统匹配合适的硬件</p>
        </div>
        <div class="solutions-mega-links">
          <a href="/zh-cn/solutions/#embedded-can-fd-expansion">
            <span>嵌入式 CAN FD 扩展</span>
            <strong>需要在嵌入式 PC 内部添加 CAN FD？</strong>
            <small>通过 Mini PCIe 添加 2 路隔离式 CAN / CAN FD 通道</small>
            <em>Dual Mini PCIe CAN FD</em>
            <b aria-hidden="true">→</b>
          </a>
          <a href="/zh-cn/solutions/#can-fd-serial-expansion">
            <span>CAN FD + 串口扩展</span>
            <strong>需要在一台设备中集成 CAN FD 与串口？</strong>
            <small>通过一个内置 USB 连接整合 CAN FD、RS-485 与 RS-232</small>
            <em>Xilume XE826</em>
            <b aria-hidden="true">→</b>
          </a>
        </div>
      </div>
    </div>` : `
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
            <em>Xilume XE826</em>
            <b aria-hidden="true">→</b>
          </a>
        </div>
      </div>
    </div>`;

  const menuDefinitions = [
    { key: "products", path: `${localePrefix}/products`, label: isSimplifiedChinese ? "产品菜单" : "Product menu", markup: productMenuMarkup },
    { key: "solutions", path: `${localePrefix}/solutions`, label: isSimplifiedChinese ? "解决方案菜单" : "Solutions menu", markup: solutionsMenuMarkup },
  ];

  headers.forEach((header, index) => {
    const inner = header.querySelector(".header-inner");
    const navigation = inner?.querySelector(":scope > nav");
    if (!inner || !navigation) return;

    const navigationId = navigation.id || `primary-navigation-${index + 1}`;
    navigation.id = navigationId;

    const button = document.createElement("button");
    button.className = "site-menu-toggle";
    button.type = "button";
    button.setAttribute("aria-controls", navigationId);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", isSimplifiedChinese ? "打开导航菜单" : "Open navigation menu");
    button.innerHTML = `<span aria-hidden="true"><i></i><i></i><i></i></span><b>${isSimplifiedChinese ? "菜单" : "Menu"}</b>`;
    inner.insertBefore(button, navigation);

    const englishPath = isSimplifiedChinese
      ? window.location.pathname.replace(/^\/zh-cn(?=\/|$)/, "") || "/"
      : window.location.pathname;
    const chinesePath = isSimplifiedChinese
      ? window.location.pathname
      : `/zh-cn${window.location.pathname === "/" ? "/" : window.location.pathname}`;
    const locationSuffix = `${window.location.search}${window.location.hash}`;
    const languageSwitch = document.createElement("nav");
    languageSwitch.className = "site-language-switch";
    languageSwitch.setAttribute("aria-label", isSimplifiedChinese ? "语言选择" : "Language selector");
    languageSwitch.innerHTML = `<a lang="zh-CN" hreflang="zh-CN" href="${chinesePath}${locationSuffix}"${isSimplifiedChinese ? ' aria-current="page"' : ""}>简体中文</a><span aria-hidden="true">/</span><a lang="en" hreflang="en" href="${englishPath}${locationSuffix}"${isSimplifiedChinese ? "" : ' aria-current="page"'}>English</a>`;
    inner.appendChild(languageSwitch);

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
      megaMenuScrim.setAttribute("aria-label", isSimplifiedChinese ? "关闭导航菜单" : "Close navigation menu");
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
    const isSimplifiedChinese = document.documentElement.lang.toLowerCase().startsWith("zh");
    const sync = () => {
      const paused = video.paused;
      if (icon) icon.textContent = paused ? "▶" : "Ⅱ";
      if (label) label.textContent = isSimplifiedChinese ? (paused ? "播放视频" : "暂停视频") : (paused ? "Play film" : "Pause film");
      button.setAttribute("aria-label", isSimplifiedChinese ? (paused ? "播放生产视频" : "暂停生产视频") : (paused ? "Play production film" : "Pause production film"));
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
