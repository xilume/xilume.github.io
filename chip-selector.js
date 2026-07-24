(function () {
  const root = document.querySelector("[data-chip-selector]");
  if (!root) return;

  const currentControllers = {
    "usb:canfd-rs485": {
      model: "XIC-U2C2R2",
      config: "USB → 2CFD + 2R485",
      summary: "USB controller for two independent CAN / CAN FD channels and two RS-485 channels.",
      host: "USB 2.0 FS",
      field: "2 CAN FD + 2 RS-485",
      flash: "256 KB class",
      package: "64-pin class"
    },
    "usb:canfd": {
      model: "XIC-U2C2",
      config: "USB → 2CFD",
      summary: "USB controller for two independent CAN / CAN FD channels.",
      host: "USB 2.0 FS",
      field: "2 × CAN / CAN FD",
      flash: "128 KB class",
      package: "48-pin class"
    },
    "usb:rs485": {
      model: "XIC-U2R2",
      config: "USB → 2R485",
      summary: "USB controller for two independent RS-485 channels.",
      host: "USB 2.0 FS",
      field: "2 × RS-485",
      flash: "128 KB class",
      package: "48-pin class"
    },
    "usb:smbus": {
      model: "XIC-USMB1",
      config: "USB → SMBus",
      summary: "USB controller for smart-battery information and SMBus communication.",
      host: "USB 2.0 FS",
      field: "Smart Battery / SMBus",
      flash: "128 KB class",
      package: "48-pin class"
    }
  };

  const hostLabels = {
    usb: "USB 2.0 FS",
    spi: "SPI host",
    uart: "UART host",
    i2c: "I²C / SMBus host"
  };

  const hostCodes = {
    usb: "USB",
    spi: "SPI",
    uart: "UART",
    i2c: "I²C"
  };

  const fieldLabels = {
    "canfd-rs485": "2 CAN FD + 2 RS-485",
    canfd: "2 × CAN / CAN FD",
    rs485: "2 × RS-485",
    smbus: "Smart Battery / SMBus"
  };

  const fieldCodes = {
    "canfd-rs485": "2CFD + 2R485",
    canfd: "2CFD",
    rs485: "2R485",
    smbus: "SMBus"
  };

  const state = {
    input: "usb",
    output: "canfd-rs485"
  };

  const nodes = {
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
    detailLink: root.querySelector("[data-detail-link]")
  };

  function render() {
    root.querySelectorAll("[data-side][data-signal]").forEach((button) => {
      const selected = state[button.dataset.side] === button.dataset.signal;
      button.setAttribute("aria-pressed", String(selected));
    });

    const controller = currentControllers[`${state.input}:${state.output}`];
    if (controller) {
      root.dataset.matchState = "current";
      nodes.status.textContent = "ENGINEERING MATCH";
      nodes.config.textContent = controller.config;
      nodes.model.textContent = controller.model;
      nodes.chipLabel.textContent = controller.model;
      nodes.summary.textContent = controller.summary;
      nodes.host.textContent = controller.host;
      nodes.field.textContent = controller.field;
      nodes.flash.textContent = controller.flash;
      nodes.packageName.textContent = controller.package;
      nodes.supply.textContent = "3.3 V logic";
      nodes.firmware.textContent = "Factory programmed";
      nodes.detailLink.textContent = "More chip information";
      nodes.detailLink.href = `products/programmed-controllers/?model=${encodeURIComponent(controller.model)}`;
      return;
    }

    const config = `${hostCodes[state.input]} → ${fieldCodes[state.output]}`;
    root.dataset.matchState = "roadmap";
    nodes.status.textContent = "ROADMAP CONFIGURATION";
    nodes.config.textContent = config;
    nodes.model.textContent = "Model assignment pending";
    nodes.chipLabel.textContent = "ROADMAP";
    nodes.summary.textContent = `${hostLabels[state.input]} to ${fieldLabels[state.output]} is included in the future controller roadmap, but is not yet an orderable standard model.`;
    nodes.host.textContent = hostLabels[state.input];
    nodes.field.textContent = fieldLabels[state.output];
    nodes.flash.textContent = "To be assigned";
    nodes.packageName.textContent = "To be assigned";
    nodes.supply.textContent = "3.3 V target";
    nodes.firmware.textContent = "Not released";
    nodes.detailLink.textContent = "View controller roadmap";
    nodes.detailLink.href = "products/programmed-controllers/#roadmap";
  }

  root.querySelectorAll("[data-side][data-signal]").forEach((button) => {
    button.addEventListener("click", () => {
      state[button.dataset.side] = button.dataset.signal;
      render();
    });
  });

  render();
})();
