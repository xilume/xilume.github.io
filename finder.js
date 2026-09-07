(function () {
  const roots = document.querySelectorAll("[data-product-finder]");
  if (!roots.length) return;
  const isSimplifiedChinese = document.documentElement.lang.toLowerCase().startsWith("zh");

  // Only current, named hardware appears in selection results.
  const solutions = isSimplifiedChinese ? [
  {
    "host": "usb",
    "target": "canfd",
    "title": "USB 工业通信：Octant 与 XE826",
    "summary": "按安装方式选择桌面扩展坞或内接模块，均提供 2 路 CAN FD 和 6 路串口",
    "href": "products/usb-canfd-rs485/",
    "module": [
      {
        "name": "Xilume Octant",
        "description": "USB 工业通信扩展坞",
        "status": "2 CAN FD + 4 RS-485 + 2 RS-232",
        "price": "US$199",
        "href": "products/8hub/"
      },
      {
        "name": "XE826",
        "description": "内部 USB 嵌入式模块",
        "status": "2 CAN FD + 4 RS-485 + 2 RS-232",
        "price": "样品与批量报价",
        "href": "products/8hub-embedded/"
      }
    ],
    "controller": {
      "name": "XL1326-A",
      "description": "用于自有 PCB 的 USB 接口芯片",
      "status": "2 CAN FD · LQFP48",
      "price": "样品与批量报价",
      "href": "products/interface-ics/#xl1326-a"
    }
  },
  {
    "host": "usb",
    "target": "canfd-rs485",
    "title": "USB 工业通信：Octant 与 XE826",
    "summary": "按安装方式选择桌面扩展坞或内接模块，均提供 2 路 CAN FD 和 6 路串口",
    "href": "products/usb-canfd-rs485/",
    "module": [
      {
        "name": "Xilume Octant",
        "description": "USB 工业通信扩展坞",
        "status": "2 CAN FD + 4 RS-485 + 2 RS-232",
        "price": "US$199",
        "href": "products/8hub/"
      },
      {
        "name": "XE826",
        "description": "内部 USB 嵌入式模块",
        "status": "2 CAN FD + 4 RS-485 + 2 RS-232",
        "price": "样品与批量报价",
        "href": "products/8hub-embedded/"
      }
    ],
    "controller": {
      "name": "XL1326",
      "description": "用于自有 PCB 的 USB 接口芯片",
      "status": "6 serial + 2 CAN FD · LQFP48",
      "price": "样品与批量报价",
      "href": "products/interface-ics/#xl1326"
    }
  },
  {
    "host": "mini-pcie",
    "target": "canfd",
    "title": "Mini PCIe 双路 CAN FD",
    "summary": "通过插槽中的 USB 信号增加两路隔离 CAN FD，数据相位最高 8 Mbit/s",
    "href": "products/mini-pcie-dual-can-fd/",
    "module": {
      "name": "Dual Mini PCIe CAN FD",
      "description": "内置双路 CAN FD 模块",
      "status": "Windows + Linux",
      "price": "US$69.99",
      "href": "products/mini-pcie-dual-can-fd/"
    },
    "controller": {
      "name": "XL1326-A",
      "description": "用于自有 PCB 的 USB 接口芯片",
      "status": "2 CAN FD · LQFP48",
      "price": "样品与批量报价",
      "href": "products/interface-ics/#xl1326-a"
    }
  },
  {
    "host": "usb",
    "target": "smbus",
    "title": "USB 智能电池接口",
    "summary": "读取兼容电池组提供的 SBS / SMBus 数据",
    "href": "products/usb-smbus/",
    "module": {
      "name": "电池显示模块",
      "description": "SBS / SMBus → USB",
      "status": "Windows + Linux",
      "price": "按电池组配置",
      "href": "products/usb-smbus/"
    },
    "controller": null
  }
] : [
  {
    "host": "usb",
    "target": "canfd",
    "title": "USB industrial communication: Octant & XE826",
    "summary": "Choose an external hub or an internal module. Both provide two CAN FD and six serial channels.",
    "href": "products/usb-canfd-rs485/",
    "module": [
      {
        "name": "Xilume Octant",
        "description": "Desktop USB industrial communication hub",
        "status": "2 CAN FD + 4 RS-485 + 2 RS-232",
        "price": "US$199",
        "href": "products/8hub/"
      },
      {
        "name": "Xilume XE826",
        "description": "Internal USB embedded module",
        "status": "2 CAN FD + 4 RS-485 + 2 RS-232",
        "price": "Sample and volume pricing",
        "href": "products/8hub-embedded/"
      }
    ],
    "controller": {
      "name": "XL1326-A",
      "description": "USB interface IC for your PCB",
      "status": "2 CAN FD · LQFP48",
      "price": "Sample and volume pricing",
      "href": "products/interface-ics/#xl1326-a"
    }
  },
  {
    "host": "usb",
    "target": "canfd-rs485",
    "title": "USB industrial communication: Octant & XE826",
    "summary": "Choose an external hub or an internal module. Both provide two CAN FD and six serial channels.",
    "href": "products/usb-canfd-rs485/",
    "module": [
      {
        "name": "Xilume Octant",
        "description": "Desktop USB industrial communication hub",
        "status": "2 CAN FD + 4 RS-485 + 2 RS-232",
        "price": "US$199",
        "href": "products/8hub/"
      },
      {
        "name": "Xilume XE826",
        "description": "Internal USB embedded module",
        "status": "2 CAN FD + 4 RS-485 + 2 RS-232",
        "price": "Sample and volume pricing",
        "href": "products/8hub-embedded/"
      }
    ],
    "controller": {
      "name": "XL1326",
      "description": "USB interface IC for your PCB",
      "status": "6 serial + 2 CAN FD · LQFP48",
      "price": "Sample and volume pricing",
      "href": "products/interface-ics/#xl1326"
    }
  },
  {
    "host": "mini-pcie",
    "target": "canfd",
    "title": "Dual Mini PCIe CAN FD",
    "summary": "Two isolated CAN FD channels, up to 8 Mbit/s data phase, using USB signals in a compatible slot.",
    "href": "products/mini-pcie-dual-can-fd/",
    "module": {
      "name": "Dual Mini PCIe CAN FD",
      "description": "Internal dual-channel CAN FD module",
      "status": "Windows + Linux",
      "price": "US$69.99",
      "href": "products/mini-pcie-dual-can-fd/"
    },
    "controller": {
      "name": "XL1326-A",
      "description": "USB interface IC for your PCB",
      "status": "2 CAN FD · LQFP48",
      "price": "Sample and volume pricing",
      "href": "products/interface-ics/#xl1326-a"
    }
  },
  {
    "host": "usb",
    "target": "smbus",
    "title": "USB smart-battery interface",
    "summary": "Read SBS / SMBus data supplied by a compatible smart battery.",
    "href": "products/usb-smbus/",
    "module": {
      "name": "Battery Display Module",
      "description": "SBS / SMBus → USB",
      "status": "Windows + Linux",
      "price": "Configured for your battery pack",
      "href": "products/usb-smbus/"
    },
    "controller": null
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
        result.setAttribute("aria-live", "polite");
        result.innerHTML = `<div class="result-path"><span class="path-node">${label(state.host)}</span><span class="path-line"></span><span class="path-node">${label(state.target)}</span></div><div class="result-content"><div class="result-top"><div><h3>${isSimplifiedChinese ? "暂无匹配产品" : "No current match"}</h3><p>${isSimplifiedChinese ? "当前目录没有此接口组合的模块，可选择 USB 接口产品或提交具体需求" : "The current catalog has no module for this combination. Explore USB products or share your integration requirements."}</p></div></div></div>`;
        return;
      }

      const formats = state.format === "both" ? ["module", "controller"] : [state.format];
      const availableItems = formats.flatMap((type) => solution[type] || []).filter(Boolean);
      const options = availableItems.length
        ? availableItems.map((item) => `<a class="result-option" href="${resolveHref(root,item.href)}"><div><strong>${item.name}</strong><span>${item.description} · ${item.status}</span><em>${item.price}</em></div><b>→</b></a>`).join("")
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
