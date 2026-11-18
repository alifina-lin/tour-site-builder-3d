/* ==== 科技大樓、市集共用：日夜切換（依電腦時間自動；可手動）、操作範圍、介面配色 ==== */
(() => {
  const T = window.__tour;
  if (!T || !T.W || !T.W.setTheme) return;
  const W = T.W, ctl = T.controls, THREE = T.THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 操作範圍：只左右轉、仰角小幅度，上下撥動留給切換樓層 */
  const LIM = Object.assign({ minPolar: 0.3, maxPolar: 1.5, minAz: -1.4, maxAz: 1.4 }, W.limits || {});
  ctl.enablePan = false;
  ctl.minPolarAngle = LIM.minPolar;
  ctl.maxPolarAngle = LIM.maxPolar;
  ctl.minAzimuthAngle = LIM.minAz;
  ctl.maxAzimuthAngle = LIM.maxAz;
  ctl.autoRotate = false;

  /* 柔和陰影 */
  if (T.renderer) {
    T.renderer.shadowMap.enabled = true;
    T.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    T.scene.traverse((o) => o.material && [].concat(o.material).forEach((m) => (m.needsUpdate = true)));
  }

  /* 介面主色：取使用者品牌色的色相，換成俐落的科技藍綠調 */
  const root = document.documentElement;
  const brand = (getComputedStyle(root).getPropertyValue("--accent") || "#1aa6c8").trim();
  const hsl = {};
  new THREE.Color(brand).getHSL(hsl);
  const accent = (night) => `hsl(${Math.round(hsl.h * 360)} ${night ? 88 : 78}% ${night ? 60 : 42}%)`;

  /* 屋頂上的網站標題不縮短 */
  const siteTitle = (document.getElementById("ttl") || {}).textContent;
  document.querySelectorAll(".lb.dy").forEach((el) => { if (el.textContent === siteTitle) el.classList.add("roof"); });

  /* 目前是第幾層、什麼模式 → 給 CSS 用，全景時只顯示樓層牌 */
  document.body.dataset.mode = "overview";
  addEventListener("tour", (e) => {
    if (e.detail && e.detail.type === "mode") document.body.dataset.mode = e.detail.mode;
  });

  /* ---------- 日夜 ---------- */
  let mix = 0, target = 0, cur = "day", last = performance.now();
  const autoName = () => { const h = new Date().getHours(); return h >= 6 && h < 18 ? "day" : "night"; };
  const btn = document.getElementById("themeb");
  const icon = {
    day: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    night: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  };
  const setTheme = (name, instant) => {
    cur = name;
    target = name === "night" ? 1 : 0;
    if (instant || reduce) { mix = target; W.setTheme(mix); }
    document.body.classList.toggle("night", name === "night");
    root.style.setProperty("--accent", accent(name === "night"));
    if (btn) {
      btn.innerHTML = icon[name];
      btn.title = name === "night" ? "夜晚（點一下切換成白天）" : "白天（點一下切換成夜晚）";
      btn.setAttribute("aria-label", btn.title);
    }
    window.dispatchEvent(new CustomEvent("tour", { detail: { type: "theme", night: name === "night", instant: !!instant } }));
  };
  let manual = false;
  const q = new URLSearchParams(location.search).get("theme");
  if (q === "day" || q === "night") { manual = true; setTheme(q, true); } else setTheme(autoName(), true);
  setInterval(() => { if (!manual && autoName() !== cur) setTheme(autoName(), false); }, 60000);
  if (btn) btn.onclick = () => { manual = true; setTheme(cur === "day" ? "night" : "day", false); };
  window.__theme = {
    set: (n) => { manual = true; setTheme(n, false); },
    get: () => cur,
    auto: () => { manual = false; setTheme(autoName(), false); },
  };
  (function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (Math.abs(target - mix) > 0.001) {
      mix += (target - mix) * Math.min(1, dt * 2.2);
      if (Math.abs(target - mix) < 0.002) mix = target;
      W.setTheme(mix);
    }
    requestAnimationFrame(tick);
  })(performance.now());
})();
