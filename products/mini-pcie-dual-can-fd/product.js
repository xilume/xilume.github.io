(() => {
  const localLinks = Array.from(document.querySelectorAll(".dcf-local-links a[href^='#']"));
  const observedSections = localLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        localLinks.forEach((link) => {
          const current = link.getAttribute("href") === `#${visible.target.id}`;
          if (current) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-22% 0px -60%", threshold: [0, 0.15, 0.4] }
    );

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const anatomyMarkers = Array.from(document.querySelectorAll("[data-anatomy-marker]"));
  const anatomyItems = Array.from(document.querySelectorAll("[data-anatomy-item]"));

  const selectAnatomy = (number) => {
    anatomyMarkers.forEach((marker) => {
      const selected = marker.dataset.anatomyMarker === number;
      marker.classList.toggle("is-active", selected);
      marker.setAttribute("aria-pressed", String(selected));
    });
    anatomyItems.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.anatomyItem === number);
    });
  };

  anatomyMarkers.forEach((marker) => {
    marker.setAttribute("aria-pressed", "false");
    marker.addEventListener("click", () => selectAnatomy(marker.dataset.anatomyMarker));
    marker.addEventListener("mouseenter", () => selectAnatomy(marker.dataset.anatomyMarker));
    marker.addEventListener("focus", () => selectAnatomy(marker.dataset.anatomyMarker));
  });

  const fitTool = document.querySelector("[data-fit-tool]");
  if (fitTool) {
    const answers = { space: null, signal: null };
    const result = fitTool.querySelector("[data-fit-result]");
    const icon = fitTool.querySelector("[data-fit-icon]");
    const status = fitTool.querySelector("[data-fit-status]");
    const title = fitTool.querySelector("[data-fit-title]");
    const copy = fitTool.querySelector("[data-fit-copy]");
    const email = document.querySelector("[data-fit-email]");

    const outcomes = {
      ready: {
        icon: "✓",
        status: "LIKELY READY FOR DESIGN REVIEW",
        title: "The basic mechanical and signal conditions are present.",
        copy: "Next: verify the connector pin route, host power budget, mounting height, cable exit, and final driver requirements."
      },
      review: {
        icon: "!",
        status: "HOST DOCUMENTATION NEEDED",
        title: "One or more compatibility details are still unknown.",
        copy: "Check the host manual or schematic for Mini PCIe mechanical clearance and USB 2.0 routing, then send it to Xilume for review."
      },
      blocked: {
        icon: "×",
        status: "NOT A DIRECT FIT",
        title: "The current host description does not meet a core requirement.",
        copy: "This module needs physical card clearance and USB 2.0 signals in the Mini PCIe connector. PCIe data lanes alone are not sufficient."
      }
    };

    const updateFit = () => {
      let state = null;
      if (answers.space && answers.signal) {
        if (answers.space === "no" || answers.signal === "pcie") state = "blocked";
        else if (answers.space === "yes" && answers.signal === "usb") state = "ready";
        else state = "review";
      }

      if (!state) {
        result.removeAttribute("data-state");
        icon.textContent = "?";
        status.textContent = "WAITING FOR INPUT";
        title.textContent = "Choose one answer in each row.";
        copy.textContent = "The checker will identify the next compatibility step.";
        return;
      }

      const outcome = outcomes[state];
      result.dataset.state = state;
      icon.textContent = outcome.icon;
      status.textContent = outcome.status;
      title.textContent = outcome.title;
      copy.textContent = outcome.copy;

      if (email) {
        const fitSummary = `Mechanical space: ${answers.space}; slot signal: ${answers.signal}`;
        email.href = `mailto:echen070301@gmail.com?subject=${encodeURIComponent("Dual Mini PCIe CAN FD host compatibility")}&body=${encodeURIComponent(`${fitSummary}\n\nHost model:\nTarget CAN bit rates:\nOther integration notes:`)}`;
      }
    };

    fitTool.querySelectorAll("[data-fit-group]").forEach((group) => {
      group.querySelectorAll("[data-fit-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          const groupName = group.dataset.fitGroup;
          answers[groupName] = button.dataset.fitAnswer;
          group.querySelectorAll("[data-fit-answer]").forEach((candidate) => {
            candidate.setAttribute("aria-pressed", String(candidate === button));
          });
          updateFit();
        });
      });
    });
  }

  const platformTabs = Array.from(document.querySelectorAll("[data-platform-tab]"));
  const platformPanels = Array.from(document.querySelectorAll("[data-platform-panel]"));

  const selectPlatform = (name, focus = false) => {
    platformTabs.forEach((tab) => {
      const selected = tab.dataset.platformTab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    platformPanels.forEach((panel) => {
      panel.hidden = panel.dataset.platformPanel !== name;
    });
  };

  platformTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectPlatform(tab.dataset.platformTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const next = (index + direction + platformTabs.length) % platformTabs.length;
      selectPlatform(platformTabs[next].dataset.platformTab, true);
    });
  });

  if (platformTabs.length) selectPlatform("windows");
})();
