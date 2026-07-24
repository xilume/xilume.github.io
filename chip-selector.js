(function () {
  const root = document.querySelector("[data-chip-configurator]");
  if (!root) return;

  const interfaceInfo = {
    host: {
      usb: { label: "USB 2.0 Device", short: "USB", code: "USB" },
      pcie: { label: "PCI Express", short: "PCIe", code: "PCIE" },
      ethernet: { label: "Ethernet", short: "Ethernet", code: "ETH" },
      spi: { label: "SPI Host", short: "SPI", code: "SPI" },
      uart: { label: "UART Host", short: "UART", code: "UART" },
      i2c: { label: "I²C / SMBus Host", short: "I²C", code: "I2C" }
    },
    field: {
      canfd: { label: "CAN FD", short: "CAN FD", code: "CFD" },
      rs485: { label: "RS-485", short: "RS-485", code: "R485" },
      can: { label: "Classic CAN", short: "CAN", code: "CAN" },
      lin: { label: "LIN Bus", short: "LIN", code: "LIN" },
      smbus: { label: "SMBus / I²C", short: "SMBus", code: "SMB" },
      gpio: { label: "UART / GPIO", short: "UART / GPIO", code: "GPIO" }
    }
  };

  const state = { host: {}, field: {} };

  const nodes = {
    selectedHost: root.querySelector("[data-selected-host]"),
    selectedField: root.querySelector("[data-selected-field]"),
    chipLabel: root.querySelector("[data-chip-label]"),
    status: root.querySelector("[data-match-status]"),
    config: root.querySelector("[data-configuration-id]"),
    model: root.querySelector("[data-match-model]"),
    summary: root.querySelector("[data-match-summary]"),
    host: root.querySelector("[data-spec-host]"),
    field: root.querySelector("[data-spec-field]"),
    flash: root.querySelector("[data-spec-flash]"),
    packageName: root.querySelector("[data-spec-package]"),
    supply: root.querySelector("[data-spec-supply]"),
    firmware: root.querySelector("[data-spec-firmware]"),
    detailLink: root.querySelector("[data-detail-link]"),
    copyStatus: root.querySelector("[data-copy-status]")
  };

  function selectedKeys(side) {
    return Object.keys(state[side]).sort();
  }

  function selectionCount(side) {
    return selectedKeys(side).length;
  }

  function only(side, allowed) {
    const selected = selectedKeys(side);
    return selected.length > 0 && selected.every((key) => allowed.includes(key));
  }

  function quantity(side, signal) {
    return state[side][signal] || 0;
  }

  function formatSelection(side, emptyLabel) {
    const selected = selectedKeys(side);
    if (!selected.length) return emptyLabel;
    return selected.map((key) => `${interfaceInfo[side][key].label} × ${state[side][key]}`).join(" + ");
  }

  function configurationCode() {
    const build = (side) => {
      const selected = selectedKeys(side);
      if (!selected.length) return "—";
      return selected.map((key) => `${interfaceInfo[side][key].code}${state[side][key]}`).join("+");
    };
    return `HOST ${build("host")} / FIELD ${build("field")}`;
  }

  function matchController() {
    const usbOnly = only("host", ["usb"]) && quantity("host", "usb") === 1;
    if (!usbOnly) return null;

    const canfd = quantity("field", "canfd");
    const rs485 = quantity("field", "rs485");
    const can = quantity("field", "can");
    const smbus = quantity("field", "smbus");

    if (only("field", ["canfd", "rs485"]) && canfd >= 1 && canfd <= 2 && rs485 >= 1 && rs485 <= 2) {
      return {
        model: "XIC-U2C2R2",
        summary: `USB programmed controller supporting ${canfd} selected CAN FD channel${canfd > 1 ? "s" : ""} and ${rs485} selected RS-485 channel${rs485 > 1 ? "s" : ""}.`,
        flash: "256 KB class",
        packageName: "64-pin class",
        capacity: "Up to 2 CAN FD + 2 RS-485"
      };
    }

    if (only("field", ["canfd"]) && canfd >= 1 && canfd <= 2) {
      return {
        model: "XIC-U2C2",
        summary: `USB programmed controller supporting ${canfd} selected CAN / CAN FD channel${canfd > 1 ? "s" : ""}.`,
        flash: "128 KB class",
        packageName: "48-pin class",
        capacity: "Up to 2 CAN / CAN FD"
      };
    }

    if (only("field", ["can"]) && can >= 1 && can <= 2) {
      return {
        model: "XIC-U2C2",
        summary: `USB programmed controller supporting ${can} selected Classic CAN channel${can > 1 ? "s" : ""}, with CAN FD-capable controller hardware.`,
        flash: "128 KB class",
        packageName: "48-pin class",
        capacity: "Up to 2 CAN / CAN FD"
      };
    }

    if (only("field", ["rs485"]) && rs485 >= 1 && rs485 <= 2) {
      return {
        model: "XIC-U2R2",
        summary: `USB programmed controller supporting ${rs485} selected RS-485 channel${rs485 > 1 ? "s" : ""}.`,
        flash: "128 KB class",
        packageName: "48-pin class",
        capacity: "Up to 2 RS-485"
      };
    }

    if (only("field", ["smbus"]) && smbus === 1) {
      return {
        model: "XIC-USMB1",
        summary: "USB programmed controller for one selected smart-battery / SMBus channel.",
        flash: "128 KB class",
        packageName: "48-pin class",
        capacity: "1 SMBus / smart-battery channel"
      };
    }

    return null;
  }

  function renderSelectedStack(side, node) {
    const selected = selectedKeys(side);
    const heading = document.createElement("small");
    heading.textContent = side === "host" ? "HOST SIDE" : "FIELD SIDE";
    node.replaceChildren(heading);

    if (!selected.length) {
      const empty = document.createElement("p");
      empty.textContent = "No interface selected";
      node.appendChild(empty);
      return;
    }

    selected.forEach((key) => {
      const tag = document.createElement("span");
      tag.textContent = `${interfaceInfo[side][key].short} × ${state[side][key]}`;
      node.appendChild(tag);
    });
  }

  function setDetailLink(enabled, href, label) {
    nodes.detailLink.textContent = label;
    nodes.detailLink.href = href;
    nodes.detailLink.classList.toggle("is-disabled", !enabled);
    nodes.detailLink.setAttribute("aria-disabled", String(!enabled));
  }

  function renderOptions() {
    root.querySelectorAll(".interface-option").forEach((option) => {
      const side = option.dataset.side;
      const signal = option.dataset.signal;
      const activeQuantity = quantity(side, signal);
      const selected = activeQuantity > 0;
      const toggle = option.querySelector(".interface-toggle");
      option.classList.toggle("is-selected", selected);
      toggle.setAttribute("aria-pressed", String(selected));
      toggle.querySelector("i").textContent = selected ? "×" : "+";
      option.querySelectorAll("[data-quantity]").forEach((button) => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.quantity) === activeQuantity));
      });
    });
  }

  function render() {
    renderOptions();
    renderSelectedStack("host", nodes.selectedHost);
    renderSelectedStack("field", nodes.selectedField);

    const hasHost = selectionCount("host") > 0;
    const hasField = selectionCount("field") > 0;
    const hostDescription = formatSelection("host", "Not selected");
    const fieldDescription = formatSelection("field", "Not selected");

    nodes.config.textContent = configurationCode();
    nodes.host.textContent = hostDescription;
    nodes.field.textContent = fieldDescription;
    nodes.copyStatus.textContent = "";

    if (!hasHost || !hasField) {
      root.dataset.matchState = "waiting";
      nodes.status.textContent = "WAITING FOR SELECTION";
      nodes.model.textContent = "Select interfaces";
      nodes.chipLabel.textContent = "XILUME";
      nodes.summary.textContent = "Choose at least one host-side interface and one field-side interface to begin matching.";
      nodes.flash.textContent = "—";
      nodes.packageName.textContent = "—";
      nodes.supply.textContent = "—";
      nodes.firmware.textContent = "—";
      setDetailLink(false, "../products/programmed-controllers/", "View product information");
      return;
    }

    const controller = matchController();
    if (controller) {
      root.dataset.matchState = "current";
      nodes.status.textContent = "ENGINEERING MATCH";
      nodes.model.textContent = controller.model;
      nodes.chipLabel.textContent = controller.model;
      nodes.summary.textContent = `${controller.summary} Controller capacity: ${controller.capacity}.`;
      nodes.flash.textContent = controller.flash;
      nodes.packageName.textContent = controller.packageName;
      nodes.supply.textContent = "3.3 V logic";
      nodes.firmware.textContent = "Factory programmed";
      setDetailLink(true, `../products/programmed-controllers/#${controller.model}`, "View product information");
      return;
    }

    root.dataset.matchState = "roadmap";
    nodes.status.textContent = "MODEL ASSIGNMENT PENDING";
    nodes.model.textContent = "XILUME configuration";
    nodes.chipLabel.textContent = "ROADMAP";
    nodes.summary.textContent = "This combination is not yet assigned to a released standard controller model. The configuration has still been captured as a clear interface requirement.";
    nodes.flash.textContent = "To be assigned";
    nodes.packageName.textContent = "To be assigned";
    nodes.supply.textContent = "3.3 V target";
    nodes.firmware.textContent = "Not released";
    setDetailLink(true, "../products/programmed-controllers/#roadmap", "View controller roadmap");
  }

  root.querySelectorAll(".interface-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const option = button.closest(".interface-option");
      const side = option.dataset.side;
      const signal = option.dataset.signal;
      if (quantity(side, signal)) {
        delete state[side][signal];
      } else {
        state[side][signal] = 1;
      }
      render();
    });
  });

  root.querySelectorAll("[data-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      const option = button.closest(".interface-option");
      state[option.dataset.side][option.dataset.signal] = Number(button.dataset.quantity);
      render();
    });
  });

  root.querySelector("[data-reset-configuration]").addEventListener("click", () => {
    state.host = {};
    state.field = {};
    render();
  });

  root.querySelector("[data-copy-configuration]").addEventListener("click", async () => {
    const controller = matchController();
    const text = [
      "XILUME controller configuration",
      `Configuration: ${configurationCode()}`,
      `Host: ${formatSelection("host", "Not selected")}`,
      `Field: ${formatSelection("field", "Not selected")}`,
      `Matched model: ${controller ? controller.model : "Model assignment pending"}`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      nodes.copyStatus.textContent = "Configuration copied.";
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      nodes.copyStatus.textContent = "Configuration copied.";
    }
  });

  render();
})();
