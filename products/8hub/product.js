(() => {
  const viewer = document.querySelector("[data-hub-interface-viewer]");
  const isSimplifiedChinese = document.documentElement.lang.toLowerCase().startsWith("zh");

  if (viewer) {
    const details = isSimplifiedChinese ? {
      can: {
        kicker:"CAN 1 + CAN 2",
        title:"2 路独立 CAN FD 通道",
        copy:"支持经典 CAN 与 CAN FD，数据相位最高 8 Mbit/s",
        meta:["2 × DE9","独立通道"]
      },
      serial: {
        kicker:"串行接口 1–6",
        title:"一个端子集成 6 路串行接口",
        copy:"2×9 / 3.5 mm 接线端子集中连接全部串行通道",
        meta:["18 个接线位","4 × RS-485 + 2 × RS-232"]
      },
      usb: {
        kicker:"主机",
        title:"一条 USB 连接主机",
        copy:"一条 USB 可接入全部 8 个逻辑通道，支持 Windows 与 Linux",
        meta:["USB 2.0 全速","Windows + Linux"]
      }
    } : {
      can: {
        kicker:"CAN 1 + CAN 2",
        title:"Two independent CAN FD channels",
        copy:"Classic CAN and CAN FD, with data rates up to 8 Mbps.",
        meta:["2 × DE9","Independent channels"]
      },
      serial: {
        kicker:"SERIAL 1–6",
        title:"Six serial channels in one terminal",
        copy:"The 2×9 / 3.5 mm terminal block keeps every serial connection together and clearly routed.",
        meta:["18 positions","4 × RS-485 + 2 × RS-232"]
      },
      usb: {
        kicker:"HOST",
        title:"One USB connection to the computer",
        copy:"All eight logical channels arrive through one Windows or Linux host interface.",
        meta:["USB 2.0 Full-Speed","Windows + Linux"]
      }
    };

    const kicker = viewer.querySelector("[data-hub-port-kicker]");
    const title = viewer.querySelector("[data-hub-port-title]");
    const copy = viewer.querySelector("[data-hub-port-copy]");
    const meta = viewer.querySelector("[data-hub-port-meta]");
    const markers = Array.from(viewer.querySelectorAll("[data-hub-port]"));
    const viewButtons = Array.from(viewer.querySelectorAll("[data-hub-view]"));
    const images = Array.from(viewer.querySelectorAll("[data-hub-image]"));

    const setPort = (port) => {
      const detail = details[port];
      if (!detail) return;
      kicker.textContent = detail.kicker;
      title.textContent = detail.title;
      copy.textContent = detail.copy;
      meta.replaceChildren(...detail.meta.map((item) => {
        const tag = document.createElement("span");
        tag.textContent = item;
        return tag;
      }));
      markers.forEach((marker) => marker.classList.toggle("is-active", marker.dataset.hubPort === port));
    };

    const setView = (view) => {
      viewButtons.forEach((button) => button.setAttribute("aria-selected", String(button.dataset.hubView === view)));
      images.forEach((image) => {
        const active = image.dataset.hubImage === view;
        image.hidden = !active;
        image.classList.toggle("is-active", active);
      });
      setPort(view === "host" ? "usb" : "can");
    };

    markers.forEach((marker) => marker.addEventListener("click", () => setPort(marker.dataset.hubPort)));
    viewButtons.forEach((button) => button.addEventListener("click", () => setView(button.dataset.hubView)));
  }

  const localLinks = Array.from(document.querySelectorAll(".hub-local-links a[href^='#']"));
  const localSections = localLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  if (localSections.length) {
    let frame = null;
    const updateCurrentSection = () => {
      frame = null;
      const marker = window.innerWidth <= 860 ? 112 : 132;
      let active = localSections[0];
      localSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) active = section;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) active = localSections[localSections.length - 1];
      localLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${active.id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    window.addEventListener("scroll", () => {
      if (frame === null) frame = window.requestAnimationFrame(updateCurrentSection);
    }, { passive:true });
    window.addEventListener("resize", updateCurrentSection);
    updateCurrentSection();
  }
})();
