"use client";

import { useEffect } from "react";

export function LandingInteractions() {
  useEffect(() => {
    // Pricing data
    const pricing: Record<number, { financing: number; others: number; lumio: number }> = {
      250000: { financing: 190961, others: 78750, lumio: 37500 },
      500000: { financing: 381923, others: 157500, lumio: 75000 },
      750000: { financing: 572885, others: 236250, lumio: 112500 },
      1000000: { financing: 763847, others: 315000, lumio: 150000 },
    };

    const fmt = (n: number) => "R$ " + n.toLocaleString("pt-BR");
    const fmtCredit = (n: number) => "R$" + (n * 1000).toLocaleString("pt-BR");

    // Value selector with type support (values match pricing tables)
    const imovelValues = [120, 200, 240, 250, 300, 400, 500, 600, 700, 800, 900, 1000];
    const veiculoValues = [50, 80, 100, 120, 150, 200, 250, 300, 400];

    let currentType = "imovel";
    let currentValues = imovelValues;
    let currentIndex = 5; // Start at 400 for imovel

    const display = document.querySelector(".value-amount");
    const simLink = document.getElementById("simulatorLink") as HTMLAnchorElement | null;
    const valueSection = document.getElementById("valueSection");

    const updateDisplay = () => {
      const val = currentValues[currentIndex];
      if (display) display.textContent = fmtCredit(val);
      if (simLink) simLink.href = `/simulador?v=${val * 1000}&t=${currentType}`;
    };

    const updateVal = (delta: number) => {
      if (delta < 0 && currentIndex > 0) currentIndex--;
      if (delta > 0 && currentIndex < currentValues.length - 1) currentIndex++;
      updateDisplay();
    };

    // Type selector buttons
    document.querySelectorAll(".type-selector .btn-option-outline").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".type-selector .btn-option-outline").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentType = (btn as HTMLElement).dataset.type || "imovel";

        if (currentType === "imovel") {
          currentValues = imovelValues;
          currentIndex = 5; // Default to 400
        } else {
          currentValues = veiculoValues;
          currentIndex = 3; // Default to 120
        }

        // Show value section
        if (valueSection) valueSection.style.display = "block";
        updateDisplay();
      });
    });

    // Value buttons
    document.querySelectorAll(".value-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateVal(btn.classList.contains("minus-btn") ? -1 : 1);
      });
    });

    // Initialize simulator link and display
    updateDisplay();

    // Parcela type toggle
    document.querySelectorAll(".parcela-option").forEach((option) => {
      option.addEventListener("click", () => {
        document.querySelectorAll(".parcela-option").forEach((o) => o.classList.remove("active"));
        option.classList.add("active");
        const input = option.querySelector("input") as HTMLInputElement;
        if (input) input.checked = true;

        const isIntegral = input?.value === "integral";
        document.querySelectorAll(".flex-col").forEach((el) => {
          (el as HTMLElement).style.display = isIntegral ? "none" : "";
        });
        document.querySelectorAll(".integral-col").forEach((el) => {
          (el as HTMLElement).style.display = isIntegral ? "" : "none";
        });
      });
    });

    // Initialize parcela columns (show flex, hide integral)
    document.querySelectorAll(".integral-col").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    // Pricing calculator
    document.querySelectorAll(".price-btn").forEach((btn) => {
      btn.addEventListener("click", function (this: HTMLElement) {
        document.querySelectorAll(".price-btn").forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        const v = +(this.dataset.value || 0);
        const d = pricing[v];
        if (!d) return;
        const creditValue = document.getElementById("creditValue");
        const financingAmount = document.getElementById("financingAmount");
        const othersAmount = document.getElementById("othersAmount");
        const lumioAmount = document.getElementById("lumioAmount");
        if (creditValue) creditValue.textContent = v.toLocaleString("pt-BR");
        if (financingAmount) financingAmount.textContent = fmt(d.financing);
        if (othersAmount) othersAmount.textContent = fmt(d.others);
        if (lumioAmount) lumioAmount.textContent = fmt(d.lumio);
      });
    });

    // FAQ accordion
    document.querySelectorAll(".faq-item").forEach((item) => {
      const button = item.querySelector("button");
      if (button) {
        button.addEventListener("click", () => {
          const isOpen = item.classList.contains("open");
          document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
          if (!isOpen) item.classList.add("open");
        });
      }
    });

    // Timeline animation
    const timelineProgress = document.getElementById("timelineProgress");
    const timelineLight = document.getElementById("timelineLight");
    const stepsTimeline = document.querySelector(".steps-timeline");
    const stepItems = document.querySelectorAll(".step-item");

    if (timelineProgress && timelineLight && stepsTimeline && stepItems.length) {
      const updateTimeline = () => {
        const rect = stepsTimeline.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const triggerPoint = viewportHeight * 0.4;

        const totalHeight = rect.height;
        const scrolled = triggerPoint - rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / totalHeight));

        timelineProgress.style.height = progress * 100 + "%";
        timelineLight.style.top = progress * (totalHeight - 14) + "px";

        stepItems.forEach((item, i) => {
          const stepProgress = (i + 0.5) / stepItems.length;
          item.classList.toggle("active", progress >= stepProgress - 0.1);
        });
      };

      window.addEventListener("scroll", updateTimeline, { passive: true });
      updateTimeline();

      // Cleanup
      return () => {
        window.removeEventListener("scroll", updateTimeline);
      };
    }
  }, []);

  return null;
}
