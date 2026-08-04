(function () {
  const roots = document.querySelectorAll("[data-product-finder]");
  if (!roots.length) return;

  const solutions = [
    {
      id: "usb-canfd",
      host: "usb",
      target: "canfd",
      title: "USB ↔ Dual CAN FD",
      summary: "Connect by USB to two independent CAN / CAN FD channels.",
      href: "products/usb-dual-can-fd/",
      module: { name: "USB Dual CAN FD Adapter", description: "USB-connected hardware", status: "In development", href: "products/usb-dual-can-fd/#module" },
      controller: { name: "USB to Dual CAN FD Controller IC", description: "XILUME controller IC for your PCB", status: "Planned", href: "products/usb-dual-can-fd/#controller" }
    },
    {
      id: "mini-pcie-canfd",
      host: "mini-pcie",
      target: "canfd",
      title: "Mini PCIe (USB) ↔ Dual CAN FD",
      summary: "Add two CAN / CAN FD channels through USB signals in a compatible Mini PCIe slot.",
      href: "products/mini-pcie-dual-can-fd/",
      module: { name: "Mini PCIe Dual CAN FD Module", description: "USB-based Mini PCIe hardware", status: "R01 engineering hardware", href: "products/mini-pcie-dual-can-fd/" },
      controller: { name: "Dual CAN FD Controller IC", description: "XILUME controller IC for a custom Mini PCIe PCB", status: "Planned", href: "products/usb-dual-can-fd/#controller" }
    },
    {
      id: "usb-canfd-rs485",
      host: "usb",
      target: "canfd-rs485",
      title: "USB ↔ Dual CAN FD + Dual RS-485",
      summary: "Connect by USB to two CAN FD networks and two RS-485 buses.",
      href: "products/usb-canfd-rs485/",
      module: { name: "USB Dual CAN FD + Dual RS-485 Adapter", description: "USB-connected hardware", status: "In development", href: "products/usb-canfd-rs485/#module" },
      controller: { name: "USB CAN FD + RS-485 Controller IC", description: "XILUME controller IC for your PCB", status: "Planned", href: "products/usb-canfd-rs485/#controller" }
    },
    {
      id: "mini-pcie-canfd-rs485",
      host: "mini-pcie",
      target: "canfd-rs485",
      title: "Mini PCIe (USB) ↔ Dual CAN FD + Dual RS-485",
      summary: "Add two CAN FD and two RS-485 channels through USB signals in a compatible Mini PCIe slot.",
      href: "products/usb-canfd-rs485/",
      module: { name: "Mini PCIe Dual CAN FD + Dual RS-485 Module", description: "USB-based Mini PCIe hardware", status: "In development", href: "products/usb-canfd-rs485/#module" },
      controller: { name: "CAN FD + RS-485 Controller IC", description: "XILUME controller IC for a custom Mini PCIe PCB", status: "Planned", href: "products/usb-canfd-rs485/#controller" }
    },
    {
      id: "usb-smbus",
      host: "usb",
      target: "smbus",
      title: "USB ↔ Smart Battery Data (SMBus)",
      summary: "Display battery level, voltage, temperature, capacity, cycle count, and status through USB.",
      href: "products/usb-smbus/",
      module: { name: "USB SMBus Battery Reader Module", description: "USB-connected battery reader", status: "In development", href: "products/usb-smbus/#module" },
      controller: { name: "USB SMBus Controller IC", description: "XILUME controller IC for your PCB", status: "In development", href: "products/usb-smbus/#controller" }
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
        result.innerHTML = `<div class="result-path"><span class="path-node">${label(state.host)}</span><span class="path-line"></span><span class="path-node">${label(state.target)}</span></div><div class="result-content"><div class="result-top"><div><h3>No current match</h3><p>Choose another interface or contact sales for a custom integration.</p></div></div></div>`;
        return;
      }

      const formats = state.format === "both" ? ["module", "controller"] : [state.format];
      const options = formats.map((type) => {
        const item = solution[type];
        return `<a class="result-option" href="${resolveHref(root,item.href)}"><div><strong>${item.name}</strong><span>${item.description} · ${item.status}</span></div><b>→</b></a>`;
      }).join("");

      result.innerHTML = `<div class="result-path"><span class="path-node">${label(state.host)}</span><span class="path-line"></span><span class="path-node">${label(state.target)}</span></div><div class="result-content"><div class="result-top"><div><h3><a href="${resolveHref(root,solution.href)}">${solution.title}</a></h3><p>${solution.summary}</p></div><span class="status">Product family</span></div><div class="result-options">${options}</div></div>`;
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
