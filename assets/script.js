/* ============================================================
   Deck engine: scroll reveal, animated bars, count-up numbers,
   progress bar, dot navigation, keyboard nav.
   All numbers below are computed from the Pima Indians Diabetes
   dataset (768 rows) in diabetes_analysis.ipynb.
   ============================================================ */

(() => {
  "use strict";

  const deck = document.querySelector(".deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotnavList = document.querySelector(".dotnav");
  const progressFill = document.querySelector(".progress-fill");

  /* ---------- build dot nav ---------- */
  slides.forEach((slide, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.setAttribute("aria-label", `slide ${i + 1}`);
    btn.addEventListener("click", () => slide.scrollIntoView({ behavior: "smooth" }));
    li.appendChild(btn);
    dotnavList.appendChild(li);
  });
  const dots = Array.from(dotnavList.querySelectorAll("li"));

  /* ---------- reveal + active-slide observer ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = slides.indexOf(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          entry.target.classList.add("in-view");
          dots.forEach((d) => d.classList.remove("active"));
          if (dots[idx]) dots[idx].classList.add("active");
          runCharts(entry.target);
        }
      });
    },
    { threshold: [0.5] }
  );
  slides.forEach((s) => io.observe(s));

  /* ---------- progress bar ---------- */
  function updateProgress() {
    const max = deck.scrollHeight - deck.clientHeight;
    const pct = max > 0 ? (deck.scrollTop / max) * 100 : 0;
    progressFill.style.width = pct + "%";
  }
  deck.addEventListener("scroll", () => requestAnimationFrame(updateProgress), { passive: true });
  updateProgress();

  /* ---------- keyboard nav ---------- */
  window.addEventListener("keydown", (e) => {
    const current = slides.findIndex((s) => s.classList.contains("in-view")) ?? 0;
    let target = -1;
    if (["ArrowDown", "PageDown", " "].includes(e.key)) target = Math.min(current + 1, slides.length - 1);
    if (["ArrowUp", "PageUp"].includes(e.key)) target = Math.max(current - 1, 0);
    if (target >= 0) {
      e.preventDefault();
      slides[target].scrollIntoView({ behavior: "smooth" });
    }
  });

  /* ---------- count-up ---------- */
  function countUp(el, to, opts = {}) {
    const { duration = 1100, decimals = 0, prefix = "", suffix = "" } = opts;
    const from = 0;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const val = from + (to - from) * ease(p);
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + to.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ---------- per-slide chart runners (idempotent) ---------- */
  const ran = new Set();
  function runCharts(slide) {
    const id = slide.id;
    if (ran.has(id)) return;
    ran.add(id);

    if (id === "slide-01") animateProportion(slide);
    if (id === "slide-02") animateBars(slide, ".bar-chart--missing");
    if (id === "slide-03") animateBars(slide, ".bar-chart--corr");
    if (id === "slide-04") animateStatDuo(slide, [110.7, 142.1], 1, "");
    if (id === "slide-05") animateStatDuo(slide, [30.9, 35.4], 1, "");
    if (id === "slide-06") animateStatDuo(slide, [31.2, 37.1], 1, "세");
    if (id === "slide-07") animateCompare(slide);
    if (id === "slide-08") animateBars(slide, ".bar-chart--importance");
  }

  function animateProportion(slide) {
    const no = slide.querySelector(".prop-seg.no");
    const yes = slide.querySelector(".prop-seg.yes");
    requestAnimationFrame(() => {
      no.style.width = "65.1%";
      yes.style.width = "34.9%";
    });
  }

  function animateBars(slide, selector) {
    const chart = slide.querySelector(selector);
    if (!chart) return;
    const fills = chart.querySelectorAll(".bar-fill");
    fills.forEach((fill) => {
      const target = fill.dataset.target;
      requestAnimationFrame(() => { fill.style.width = target + "%"; });
    });
  }

  function animateStatDuo(slide, values, decimals, suffix) {
    const els = slide.querySelectorAll(".stat-value");
    els.forEach((el, i) => {
      if (values[i] !== undefined) countUp(el, values[i], { decimals, suffix, duration: 1300 });
    });
  }

  function animateCompare(slide) {
    const fills = slide.querySelectorAll(".compare-fill");
    fills.forEach((fill) => {
      const target = fill.dataset.target;
      requestAnimationFrame(() => { fill.style.width = target + "%"; });
    });
  }
})();
