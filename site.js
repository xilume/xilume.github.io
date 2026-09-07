(() => {
  const headers = document.querySelectorAll(".site-header");
  const desktopNavigation = window.matchMedia("(min-width: 901px)");
  const isSimplifiedChinese = document.documentElement.lang.toLowerCase().startsWith("zh");
  const localePrefix = isSimplifiedChinese ? "/zh-cn" : "";

  const productMenuMarkup = isSimplifiedChinese ? `
    <div class="container product-mega-menu-inner">
      <div class="product-mega-menu-intro">
        <span>产品系列</span>
        <strong>接口芯片与接口模块</strong>
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
              <strong>双路 Mini PCIe CAN FD</strong>
              <small>2 路带信号隔离的 CAN/CAN FD 通道</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/zh-cn/products/8hub-embedded/">
              <span>嵌入式 8 通道通信模块</span>
              <strong>XE826</strong>
              <small>内置 USB 提供 2 路 CAN FD + 6 路串行接口</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-diagnostic">
          <div class="product-mega-group-heading">
            <small>02</small>
            <h2 id="product-family-diagnostic">USB 工业通信</h2>
            <p>电脑端工业接口扩展</p>
          </div>
          <div class="product-mega-links">
            <a href="/zh-cn/products/8hub/">
              <span>八通道 USB 工业通信扩展坞</span>
              <strong>型号 Octant</strong>
              <small>让 Windows 或 Linux 电脑接入 CAN FD、RS-485 和 RS-232</small>
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
              <small>6 路串行 + 2 路 CAN FD</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/zh-cn/products/interface-ics/#family-serial">
              <span>多通道串行接口</span>
              <strong>串行接口芯片</strong>
              <small>8 路串行通道</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/zh-cn/products/interface-ics/#family-canfd">
              <span>CAN FD</span>
              <strong>CAN FD 接口芯片</strong>
              <small>2 路 CAN FD 通道</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-power">
          <div class="product-mega-group-heading">
            <small>04</small>
            <h2 id="product-family-power">智能电池接口</h2>
            <p>SBS / SMBus 数据</p>
          </div>
          <div class="product-mega-links">
            <a href="/zh-cn/products/usb-smbus/">
              <span>智能电池状态</span>
              <strong>电池显示模块</strong>
              <small>为 Windows 和 Linux 提供电池数据与系统状态</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
      </div>
    </div>` : `
    <div class="container product-mega-menu-inner">
      <div class="product-mega-menu-intro">
        <span>PRODUCT FAMILIES</span>
        <strong>Industrial interface hardware and ICs.</strong>
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
            <h2 id="product-family-diagnostic">USB Industrial Communication</h2>
            <p>Host interface expansion</p>
          </div>
          <div class="product-mega-links">
            <a href="/products/8hub/">
              <span>8-Channel USB Industrial Communication Hub</span>
              <strong>Model Octant</strong>
              <small>Connect Windows or Linux hosts to CAN FD, RS-485, and RS-232</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-ics">
          <div class="product-mega-group-heading">
            <small>03</small>
            <h2 id="product-family-ics"><a href="/products/interface-ics/">Interface ICs</a></h2>
            <p>XL devices by interface mix</p>
          </div>
          <div class="product-mega-links">
            <a href="/products/interface-ics/#family-mixed">
              <span>Serial + CAN FD</span>
              <strong>Mixed-interface ICs</strong>
              <small>6 serial + 2 CAN FD controller channels</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/products/interface-ics/#family-serial">
              <span>Multi-channel serial</span>
              <strong>Serial interface ICs</strong>
              <small>8 serial controller channels</small>
              <b aria-hidden="true">→</b>
            </a>
            <a href="/products/interface-ics/#family-canfd">
              <span>CAN FD</span>
              <strong>CAN FD interface ICs</strong>
              <small>2 CAN FD controller channels</small>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>
        <section class="product-mega-group" aria-labelledby="product-family-power">
          <div class="product-mega-group-heading">
            <small>04</small>
            <h2 id="product-family-power">Smart-Battery Interfaces</h2>
            <p>SBS / SMBus data</p>
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
        <strong>找到您的应用场景</strong>
        <a href="/zh-cn/solutions/">查看全部解决方案 <b aria-hidden="true">→</b></a>
      </div>
      <div class="solutions-mega-content">
        <div class="solutions-mega-heading">
          <h2>您的工业接口用在哪里？</h2>
          <p>从移动调试电脑、设备内部扩展，到自己的原理图与电路板设计</p>
        </div>
        <div class="solutions-mega-links">
          <a href="/zh-cn/solutions/#embedded-can-fd-expansion">
            <span>工控机连接 CAN 设备</span>
            <strong>为现有工控机内置双路隔离 CAN FD</strong>
            <small>通过 Mini PCIe 在机箱内扩展 CAN/CAN FD，连接电机驱动器、控制模块或传感器，用于设备改造与嵌入式控制</small>
            <em>双路 Mini PCIe CAN FD</em>
            <b aria-hidden="true">→</b>
          </a>
          <a href="/zh-cn/solutions/#can-fd-serial-expansion">
            <span>机器人与自动化设备</span>
            <strong>在设备内部集中接入多种工业接口</strong>
            <small>通过内置 USB 扩展 CAN FD、RS-485 和 RS-232，在机器人或自动化设备中连接驱动器、仪表与传感器</small>
            <em>XE826</em>
            <b aria-hidden="true">→</b>
          </a>
          <a href="/zh-cn/solutions/#external-usb-expansion">
            <span>汽车测试与工业现场</span>
            <strong>为移动调试电脑增加工业接口</strong>
            <small>笔记本或便携工控机通过 USB 接入 CAN FD、RS-485 和 RS-232，用于汽车电子台架测试、设备联调和现场排查</small>
            <em>Octant</em>
            <b aria-hidden="true">→</b>
          </a>
          <a href="/zh-cn/solutions/#interface-ic-integration">
            <span>自研控制器与电路板</span>
            <strong>把通信接口集成到自己的原理图设计中</strong>
            <small>设计控制器或专用设备时，选用 XL 接口芯片，将 CAN FD 或多路串口电路直接集成到原理图与 PCB 中</small>
            <em>XL 接口芯片</em>
            <b aria-hidden="true">→</b>
          </a>
        </div>
      </div>
    </div>` : `
    <div class="container solutions-mega-menu-inner">
      <div class="product-mega-menu-intro">
        <span>SOLUTIONS</span>
        <strong>Find your application.</strong>
        <a href="/solutions/">View all solutions <b aria-hidden="true">→</b></a>
      </div>
      <div class="solutions-mega-content">
        <div class="solutions-mega-heading">
          <h2>Where do you need industrial interfaces?</h2>
          <p>Connect a portable test computer, expand a machine, or design the interfaces into your own circuit board.</p>
        </div>
        <div class="solutions-mega-links">
          <a href="/solutions/#embedded-can-fd-expansion">
            <span>Industrial PC upgrades</span>
            <strong>Add isolated CAN FD inside an existing industrial PC.</strong>
            <small>Use Mini PCIe to connect motor drives, control modules or sensors over two CAN/CAN FD channels for machine upgrades and embedded control.</small>
            <em>Dual Mini PCIe CAN FD</em>
            <b aria-hidden="true">→</b>
          </a>
          <a href="/solutions/#can-fd-serial-expansion">
            <span>Robotics &amp; automation</span>
            <strong>Connect multiple industrial interfaces inside a machine.</strong>
            <small>Use internal USB to add CAN FD, RS-485 and RS-232, connecting drives, instruments and sensors inside a robot or automation system.</small>
            <em>XE826</em>
            <b aria-hidden="true">→</b>
          </a>
          <a href="/solutions/#external-usb-expansion">
            <span>Automotive tests &amp; industrial fieldwork</span>
            <strong>Add industrial ports to a portable test computer.</strong>
            <small>Connect a laptop or portable industrial PC to CAN FD, RS-485 and RS-232 over USB for automotive bench tests, equipment commissioning and field troubleshooting.</small>
            <em>Octant</em>
            <b aria-hidden="true">→</b>
          </a>
          <a href="/solutions/#interface-ic-integration">
            <span>Custom controllers &amp; circuit boards</span>
            <strong>Integrate communication interfaces into your own schematic.</strong>
            <small>Choose an XL interface IC when designing a controller or dedicated device, and build CAN FD or multi-channel serial circuits into your schematic and PCB.</small>
            <em>XL Interface ICs</em>
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

    const alternatePath = (language) => {
      const link = document.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
      return link ? new URL(link.href, window.location.href).pathname : null;
    };
    const englishPath = alternatePath("en") || (isSimplifiedChinese
      ? window.location.pathname.replace(/^\/zh-cn(?=\/|$)/, "") || "/"
      : window.location.pathname);
    const chinesePath = alternatePath("zh-CN") || (isSimplifiedChinese
      ? window.location.pathname
      : window.location.pathname.startsWith("/downloads/") ? "/zh-cn/downloads/" : "/zh-cn/");
    const locationSuffix = document.querySelector('link[rel="alternate"][hreflang="zh-CN"]') ? `${window.location.search}${window.location.hash}` : "";
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
      entries.forEach((option) => {
        const open = option === entry;
        option.trigger.setAttribute("aria-expanded", String(open));
        option.panel.setAttribute("aria-hidden", String(!open));
        option.panel.inert = !open;
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
        entry.panel.addEventListener("click", (event) => {
          if (event.target.closest("a[href]")) closeMegaMenu();
        });
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
      button.setAttribute("aria-label", isSimplifiedChinese ? "打开导航菜单" : "Open navigation menu");
    };

    button.addEventListener("click", () => {
      const open = !header.classList.contains("is-menu-open");
      header.classList.toggle("is-menu-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", isSimplifiedChinese ? (open ? "关闭导航菜单" : "打开导航菜单") : (open ? "Close navigation menu" : "Open navigation menu"));
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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) { video.autoplay = false; video.pause(); }
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    sync();
  });
})();
