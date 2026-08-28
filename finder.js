(function () {
  const roots = document.querySelectorAll("[data-product-finder]");
  if (!roots.length) return;
  const isSimplifiedChinese = document.documentElement.lang.toLowerCase().startsWith("zh");

  const solutions = isSimplifiedChinese ? [
    {
      id: "usb-canfd",
      host: "usb",
      target: "canfd",
      title: "USB ↔ 双通道 CAN FD",
      summary: "通过 USB 接入 2 路独立 CAN/CAN FD 通道",
      href: "products/usb-dual-can-fd/",
      module: { name: "USB 双通道 CAN FD 适配器", description: "USB 外接硬件", status: "双通道 CAN FD", href: "products/usb-dual-can-fd/#module" },
      controller: { name: "XL1326-A", description: "用于 PCB 的双通道 CAN FD 接口芯片", status: "仅 2 路 CAN FD · LQFP48", href: "products/interface-ics/#xl1326-a" }
    },
    {
      id: "mini-pcie-canfd",
      host: "mini-pcie",
      target: "canfd",
      title: "Mini PCIe（USB）↔ 双通道 CAN FD",
      summary: "增加 2 路带信号隔离的 CAN/CAN FD 通道，数据相位最高 8 Mbit/s，支持 Windows 与 Linux 驱动",
      href: "products/mini-pcie-dual-can-fd/",
      module: { name: "Mini PCIe 双通道 CAN FD 模块", description: "双路信号隔离内置模块", status: "Windows + Linux", href: "products/mini-pcie-dual-can-fd/" },
      controller: { name: "XL1326-A", description: "用于 PCB 的双通道 CAN FD 接口芯片", status: "仅 2 路 CAN FD · LQFP48", href: "products/interface-ics/#xl1326-a" }
    },
    {
      id: "usb-canfd-rs485",
      host: "usb",
      target: "canfd-rs485",
      title: "USB ↔ 双通道 CAN FD + 双通道 RS-485",
      summary: "通过 USB 接入 2 路 CAN FD 和 2 路 RS-485 通道",
      href: "products/usb-canfd-rs485/",
      module: { name: "USB 双通道 CAN FD + 双通道 RS-485 适配器", description: "USB 外接硬件", status: "混合接口", href: "products/usb-canfd-rs485/#module" },
      controller: { name: "XL1326", description: "用于 PCB 的 8 端口接口芯片", status: "8 个 COM · 6 路串行 + 2 路 CAN FD", href: "products/interface-ics/#xl1326" }
    },
    {
      id: "mini-pcie-canfd-rs485",
      host: "mini-pcie",
      target: "canfd-rs485",
      title: "Mini PCIe（USB）↔ 双通道 CAN FD + 双通道 RS-485",
      summary: "通过兼容 Mini PCIe 插槽中的 USB 信号添加 2 路 CAN FD 和 2 路 RS-485 通道",
      href: "products/usb-canfd-rs485/",
      module: { name: "Mini PCIe 双通道 CAN FD + 双通道 RS-485 模块", description: "基于 USB 的 Mini PCIe 硬件", status: "混合接口", href: "products/usb-canfd-rs485/#module" },
      controller: { name: "XL1326", description: "用于 PCB 的 8 端口接口芯片", status: "8 个 COM · 6 路串行 + 2 路 CAN FD", href: "products/interface-ics/#xl1326" }
    },
    {
      id: "usb-smbus",
      host: "usb",
      target: "smbus",
      title: "USB ↔ 智能电池数据（SMBus）",
      summary: "通过 USB 向主机提供电量、电压、温度、容量、循环次数和状态",
      href: "products/usb-smbus/",
      module: { name: "熙联迈电池显示模块", description: "USB 智能电池接口", status: "Windows + Linux", href: "products/usb-smbus/" },
      controller: null
    }
  ] : [
    {
      id: "usb-canfd",
      host: "usb",
      target: "canfd",
      title: "USB ↔ Dual CAN FD",
      summary: "Connect by USB to two independent CAN / CAN FD channels.",
      href: "products/usb-dual-can-fd/",
      module: { name: "USB Dual CAN FD Adapter", description: "USB-connected hardware", status: "Dual CAN FD", href: "products/usb-dual-can-fd/#module" },
      controller: { name: "XL1326-A", description: "Dual CAN FD interface IC for your PCB", status: "2 CAN FD only · LQFP48", href: "products/interface-ics/#xl1326-a" }
    },
    {
      id: "mini-pcie-canfd",
      host: "mini-pcie",
      target: "canfd",
      title: "Mini PCIe (USB) ↔ Dual CAN FD",
      summary: "Add two CAN / CAN FD channels up to 8 Mbps with signal isolation and Windows and Linux driver support.",
      href: "products/mini-pcie-dual-can-fd/",
      module: { name: "Mini PCIe Dual CAN FD Module", description: "Isolated dual-channel internal hardware", status: "Windows + Linux", href: "products/mini-pcie-dual-can-fd/" },
      controller: { name: "XL1326-A", description: "Dual CAN FD interface IC for your PCB", status: "2 CAN FD only · LQFP48", href: "products/interface-ics/#xl1326-a" }
    },
    {
      id: "usb-canfd-rs485",
      host: "usb",
      target: "canfd-rs485",
      title: "USB ↔ Dual CAN FD + Dual RS-485",
      summary: "Connect by USB to two CAN FD networks and two RS-485 buses.",
      href: "products/usb-canfd-rs485/",
      module: { name: "USB Dual CAN FD + Dual RS-485 Adapter", description: "USB-connected hardware", status: "Multi-interface", href: "products/usb-canfd-rs485/#module" },
      controller: { name: "XL1326", description: "8-port interface IC for your PCB", status: "8 COM · 6 serial + 2 CAN FD", href: "products/interface-ics/#xl1326" }
    },
    {
      id: "mini-pcie-canfd-rs485",
      host: "mini-pcie",
      target: "canfd-rs485",
      title: "Mini PCIe (USB) ↔ Dual CAN FD + Dual RS-485",
      summary: "Add two CAN FD and two RS-485 channels through USB signals in a compatible Mini PCIe slot.",
      href: "products/usb-canfd-rs485/",
      module: { name: "Mini PCIe Dual CAN FD + Dual RS-485 Module", description: "USB-based Mini PCIe hardware", status: "Multi-interface", href: "products/usb-canfd-rs485/#module" },
      controller: { name: "XL1326", description: "8-port interface IC for your PCB", status: "8 COM · 6 serial + 2 CAN FD", href: "products/interface-ics/#xl1326" }
    },
    {
      id: "usb-smbus",
      host: "usb",
      target: "smbus",
      title: "USB ↔ Smart Battery Data (SMBus)",
      summary: "Display battery level, voltage, temperature, capacity, cycle count, and status through USB.",
      href: "products/usb-smbus/",
      module: { name: "Xilume Battery Display Module", description: "USB-connected smart-battery interface", status: "Windows + Linux", href: "products/usb-smbus/" },
      controller: null
    }
  ];

  function resolveHref(root, href) {
    const prefix = root.dataset.pathPrefix || "";
    return prefix + href;
  }

  roots.forEach((root) => {
    const state = { host: root.dataset.defaultHost || "usb", target: root.dataset.defaultTarget || "canfd", format: root.dataset.defaultFormat || "both" };
    const requestedFormat = new URLSearchParams(window.location.search).get("format");
    if (["module", "controller", "both"].includes(requestedFormat)) state.format = requestedFormat;
    const result = root.querySelector("[data-finder-result]");

    function render() {
      root.querySelectorAll("[data-choice]").forEach((button) => {
        const group = button.dataset.group;
        button.setAttribute("aria-pressed", String(state[group] === button.dataset.choice));
      });

      const solution = solutions.find((item) => item.target === state.target && item.host === state.host);
      if (!solution) {
        result.innerHTML = `<div class="result-path"><span class="path-node">${label(state.host)}</span><span class="path-line"></span><span class="path-node">${label(state.target)}</span></div><div class="result-content"><div class="result-top"><div><h3>${isSimplifiedChinese ? "暂无匹配产品" : "No current match"}</h3><p>${isSimplifiedChinese ? "请选择其他接口，或联系销售确认可选产品" : "Choose another interface or contact sales for a custom integration."}</p></div></div></div>`;
        return;
      }

      const formats = state.format === "both" ? ["module", "controller"] : [state.format];
      const availableItems = formats.map((type) => solution[type]).filter(Boolean);
      const options = availableItems.length
        ? availableItems.map((item) => `<a class="result-option" href="${resolveHref(root,item.href)}"><div><strong>${item.name}</strong><span>${item.description} · ${item.status}</span></div><b>→</b></a>`).join("")
        : `<div class="result-option"><div><strong>${isSimplifiedChinese ? "联系销售确认可选产品" : "Contact sales to choose an interface IC"}</strong><span>${isSimplifiedChinese ? "请提供接口和系统要求，熙联迈将推荐合适器件" : "We will recommend the right device for your interface and system requirements."}</span></div></div>`;

      result.innerHTML = `<div class="result-path"><span class="path-node">${label(state.host)}</span><span class="path-line"></span><span class="path-node">${label(state.target)}</span></div><div class="result-content"><div class="result-top"><div><h3><a href="${resolveHref(root,solution.href)}">${solution.title}</a></h3><p>${solution.summary}</p></div><span class="status">${isSimplifiedChinese ? "产品系列" : "Product family"}</span></div><div class="result-options">${options}</div></div>`;
    }

    function label(value) {
      return { usb:"USB", "mini-pcie":"Mini PCIe", canfd:"CAN FD", "canfd-rs485":"CAN FD + 485", smbus:"SMBus" }[value] || value;
    }

    root.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        state[button.dataset.group] = button.dataset.choice;
        render();
      });
    });
    render();
  });
})();
