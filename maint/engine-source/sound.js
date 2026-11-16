
/* ==== 即時合成音效（Web Audio）：按鈕、光柱、翻卡、故事飛入；全景時淡淡的水聲、風聲、鳥鳴（夜晚換成蟲鳴）==== */
(() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  const btn = document.getElementById("sndb");
  if (!AC) { btn && (btn.style.display = "none"); return; }
  let ctx = null, master, sfx, amb, revIn, white, brown;
  let on = false, night = document.body.classList.contains("night"), mode = "overview";
  const icons = {
    on: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    off: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  };
  const paint = () => { if (!btn) return; btn.innerHTML = on ? icons.on : icons.off; btn.title = on ? "音效：開（點一下關閉）" : "音效：關（點一下開啟）"; btn.setAttribute("aria-label", btn.title); btn.classList.toggle("off", !on); };
  paint();

  const noiseBuf = (kind, sec) => {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return b;
  };
  const impulse = (sec, decay) => {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  };
  const init = () => {
    if (ctx) { ctx.state === "suspended" && ctx.resume(); return; }
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = on ? 0.9 : 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = 3.5; sfx.connect(master);
    amb = ctx.createGain(); amb.gain.value = 0; amb.connect(master);
    const rev = ctx.createConvolver(); rev.buffer = impulse(2.6, 2.4);
    revIn = ctx.createGain(); revIn.gain.value = 0.5; revIn.connect(rev); rev.connect(master);
    white = noiseBuf("white", 4); brown = noiseBuf("brown", 6);
    buildAmbience();
    setAmb(true);
  };

  /* ---------- 基本音色 ---------- */
  const out = (node, pan, rv, dest) => {
    const p = ctx.createStereoPanner(); p.pan.value = pan || 0;
    node.connect(p); p.connect(dest || sfx);
    if (rv) { const s = ctx.createGain(); s.gain.value = rv; p.connect(s); s.connect(revIn); }
    return p;
  };
  const envG = (t0, a, v, d) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    return g;
  };
  const tone = ({ f = 440, f2, type = "sine", t = 0, a = 0.005, d = 0.2, v = 0.1, pan = 0, rv = 0.2, dest }) => {
    const t0 = ctx.currentTime + t, o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    f2 && o.frequency.exponentialRampToValueAtTime(f2, t0 + a + d * 0.8);
    const g = envG(t0, a, v, d); o.connect(g); out(g, pan, rv, dest);
    o.start(t0); o.stop(t0 + a + d + 0.05);
  };
  const hiss = ({ t = 0, a = 0.01, d = 0.2, v = 0.1, type = "bandpass", f = 1000, f2, q = 1, pan = 0, pan2, rv = 0.1, buf }) => {
    const t0 = ctx.currentTime + t, src = ctx.createBufferSource();
    src.buffer = buf || white;
    const flt = ctx.createBiquadFilter(); flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(f, t0); f2 && flt.frequency.exponentialRampToValueAtTime(f2, t0 + a + d);
    const g = envG(t0, a, v, d); src.connect(flt); flt.connect(g);
    const p = out(g, pan, rv);
    pan2 != null && p.pan.linearRampToValueAtTime(pan2, t0 + a + d);
    src.start(t0, Math.random() * 2); src.stop(t0 + a + d + 0.05);
  };
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);

  /* ---------- 音效 ---------- */
  const SFX = {
    click: () => { tone({ f: 1300, f2: 900, type: "triangle", a: 0.002, d: 0.07, v: 0.05, rv: 0.05 }); tone({ f: 2600, a: 0.001, d: 0.03, v: 0.015, rv: 0 }); },
    primary: () => { tone({ f: N(84), a: 0.004, d: 0.18, v: 0.06, rv: 0.3 }); tone({ f: N(91), t: 0.09, a: 0.004, d: 0.3, v: 0.06, rv: 0.35 }); },
    island: () => {
      tone({ f: N(57), a: 0.12, d: 0.9, v: 0.045, rv: 0.4 }); tone({ f: N(64), a: 0.12, d: 0.9, v: 0.035, rv: 0.4, pan: 0.2 });
      hiss({ type: "lowpass", f: 300, f2: 1400, a: 0.25, d: 0.5, v: 0.05, rv: 0.2 });
    },
    beam: () => {
      const sc = [84, 86, 88, 91, 93, 96, 98, 100, 103];
      sc.forEach((n, i) => tone({ f: N(n), type: i % 2 ? "sine" : "triangle", t: i * 0.055, a: 0.003, d: 0.55, v: 0.042 - i * 0.003, pan: -0.5 + i * 0.12, rv: 0.55 }));
      for (let i = 0; i < 16; i++) tone({ f: 2800 + Math.random() * 3800, t: 0.25 + Math.random() * 1.5, a: 0.002, d: 0.06 + Math.random() * 0.1, v: 0.012 + Math.random() * 0.016, pan: Math.random() * 1.6 - 0.8, rv: 0.6 });
      hiss({ type: "highpass", f: 1800, f2: 7000, a: 0.45, d: 0.9, v: 0.022, rv: 0.4 });
      tone({ f: N(60), a: 0.3, d: 1.3, v: 0.03, rv: 0.4 }); tone({ f: N(67), a: 0.3, d: 1.3, v: 0.022, rv: 0.4 });
    },
    flip: () => {
      hiss({ f: 900, f2: 3400, q: 0.9, a: 0.004, d: 0.13, v: 0.13, rv: 0.08 });
      hiss({ f: 3000, f2: 1400, q: 1.2, t: 0.1, a: 0.004, d: 0.1, v: 0.06, rv: 0.05 });
      tone({ f: 190, f2: 120, a: 0.003, d: 0.09, v: 0.05, rv: 0 });
    },
    storyExit: () => hiss({ f: 2600, f2: 500, q: 1.3, a: 0.05, d: 0.5, v: 0.13, pan: -0.1, pan2: 0.7, rv: 0.15 }),
    storyLand: () => { tone({ f: 660, f2: 990, a: 0.004, d: 0.12, v: 0.055, pan: 0.5, rv: 0.2 }); tone({ f: 1320, t: 0.06, a: 0.003, d: 0.25, v: 0.025, pan: 0.5, rv: 0.35 }); },
    panel: () => { hiss({ f: 1100, f2: 2300, q: 0.7, a: 0.02, d: 0.2, v: 0.05, pan: 0.5, rv: 0.1 }); tone({ f: N(81), t: 0.05, a: 0.006, d: 0.35, v: 0.022, pan: 0.5, rv: 0.35 }); },
    count: () => tone({ f: 700, f2: 1500, type: "triangle", a: 0.02, d: 0.6, v: 0.018, rv: 0.2 }),
    end: () => [72, 76, 79, 84].forEach((n, i) => tone({ f: N(n), t: i * 0.12, a: 0.01, d: 1.3, v: 0.04, rv: 0.5 })),
    day: () => [79, 83, 86, 91].forEach((n, i) => tone({ f: N(n), t: i * 0.07, a: 0.004, d: 0.5, v: 0.04, rv: 0.4 })),
    night: () => [88, 84, 79, 76].forEach((n, i) => tone({ f: N(n), t: i * 0.11, a: 0.01, d: 0.9, v: 0.035, rv: 0.7 })),
  };
  const play = (k) => { if (!ctx || !on || ctx.state !== "running") return; try { SFX[k] && SFX[k](); } catch (e) {} };

  /* ---------- 環境音 ---------- */
  let layers = {};
  const lfo = (freq, depth, param, base) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(param); param.value = base; o.start();
  };
  const loop = (buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, Math.random() * 3); return s; };
  const buildAmbience = () => {
    // 水聲：低頻噪音＋慢速浪潮起伏
    const w = loop(brown), wl = ctx.createBiquadFilter(); wl.type = "lowpass"; wl.frequency.value = 480;
    const wg = ctx.createGain(); lfo(0.085, 0.28, wg.gain, 0.55);
    const wv = ctx.createGain(); wv.gain.value = 0;
    w.connect(wl); wl.connect(wg); wg.connect(wv); wv.connect(amb);
    // 浪花細沙聲
    const s = loop(white), sb = ctx.createBiquadFilter(); sb.type = "bandpass"; sb.frequency.value = 1300; sb.Q.value = 0.6;
    const sg = ctx.createGain(); lfo(0.07, 0.025, sg.gain, 0.03);
    s.connect(sb); sb.connect(sg); sg.connect(wv);
    // 風聲：帶通噪音，頻率與音量緩慢飄移
    const f = loop(white), fb = ctx.createBiquadFilter(); fb.type = "bandpass"; fb.Q.value = 0.8;
    lfo(0.045, 260, fb.frequency, 560);
    const fg = ctx.createGain(); lfo(0.031, 0.05, fg.gain, 0.07);
    const fv = ctx.createGain(); fv.gain.value = 0;
    f.connect(fb); fb.connect(fg); fg.connect(fv); fv.connect(amb);
    layers = { water: wv, wind: fv };
    birdLoop(); cricketLoop();
  };
  const ambTarget = () => (!on ? 0 : mode === "overview" ? 0.2 : mode === "island" ? 0.1 : 0);
  const setAmb = (instant) => {
    if (!ctx) return;
    const t = ctx.currentTime, k = ambTarget();
    amb.gain.cancelScheduledValues(t); amb.gain.setValueAtTime(amb.gain.value, t);
    amb.gain.linearRampToValueAtTime(k, t + (instant ? 0.05 : k > amb.gain.value ? 2.5 : 1.2));
    const wv = layers.water, fv = layers.wind;
    if (wv) { wv.gain.setTargetAtTime(night ? 0.8 : 1, t, 0.8); fv.gain.setTargetAtTime(night ? 0.75 : 0.5, t, 0.8); }
  };
  const ambActive = () => ctx && on && ctx.state === "running" && ambTarget() > 0 && !document.hidden;
  const chirp = (t0, pan) => {
    const n = 2 + Math.floor(Math.random() * 4), base = 2500 + Math.random() * 1700;
    for (let i = 0; i < n; i++) {
      const tt = t0 + i * (0.09 + Math.random() * 0.06), o = ctx.createOscillator(), up = Math.random() < 0.5;
      o.frequency.setValueAtTime(base * (up ? 0.85 : 1.15), tt);
      o.frequency.exponentialRampToValueAtTime(base * (up ? 1.25 : 0.8), tt + 0.06);
      const g = envG(tt, 0.008, 0.022 + Math.random() * 0.012, 0.07);
      o.connect(g); out(g, pan, 0.25, amb); o.start(tt); o.stop(tt + 0.1);
    }
  };
  const gull = (t0, pan) => {
    const o = ctx.createOscillator(), lp = ctx.createBiquadFilter();
    o.type = "sawtooth"; lp.type = "lowpass"; lp.frequency.value = 1800;
    o.frequency.setValueAtTime(1150, t0); o.frequency.exponentialRampToValueAtTime(720, t0 + 0.35);
    const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 28; vg.gain.value = 30; vib.connect(vg); vg.connect(o.frequency);
    const g = envG(t0, 0.03, 0.012, 0.38);
    o.connect(lp); lp.connect(g); out(g, pan, 0.4, amb);
    o.start(t0); vib.start(t0); o.stop(t0 + 0.45); vib.stop(t0 + 0.45);
  };
  const birdLoop = () => {
    if (ambActive() && !night) {
      const t0 = ctx.currentTime + 0.05, pan = Math.random() * 1.4 - 0.7;
      Math.random() < 0.18 ? (gull(t0, pan), Math.random() < 0.5 && gull(t0 + 0.5, pan)) : (chirp(t0, pan), Math.random() < 0.4 && chirp(t0 + 0.5 + Math.random() * 0.4, pan + 0.2));
    }
    setTimeout(birdLoop, 2500 + Math.random() * 5000);
  };
  const cricketLoop = () => {
    if (ambActive() && night) {
      const t0 = ctx.currentTime + 0.05, f = 4300 + Math.random() * 500, pan = Math.random() * 1.6 - 0.8, n = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) {
        const tt = t0 + i * 0.05, o = ctx.createOscillator(); o.frequency.value = f;
        const g = envG(tt, 0.004, 0.008 + Math.random() * 0.005, 0.022);
        o.connect(g); out(g, pan, 0.15, amb); o.start(tt); o.stop(tt + 0.04);
      }
    }
    setTimeout(cricketLoop, 700 + Math.random() * 900);
  };

  /* ---------- 事件串接 ---------- */
  const unlock = () => { init(); };
  addEventListener("pointerdown", unlock, true);
  addEventListener("keydown", unlock, true);
  document.addEventListener("pointerdown", (e) => {
    const el = e.target.closest && e.target.closest("button, .lb, a");
    if (!el || el === btn) return;
    setTimeout(() => play(el.matches("#go, #again, #isl-go") ? "primary" : "click"), 0);
  });
  addEventListener("tour", (e) => {
    const d = e.detail || {};
    if (d.type === "mode") { mode = d.mode; setAmb(); }
    else if (d.type === "theme") { night = d.night; setAmb(); d.instant || play(night ? "night" : "day"); }
    else if (d.type === "pick") play("click");
    else play(d.type);
  });
  document.addEventListener("visibilitychange", () => { if (!ctx) return; document.hidden ? ctx.suspend() : ctx.resume(); });
  if (btn) btn.onclick = () => {
    init(); on = !on; paint();
    const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(on ? 0.9 : 0, t + 0.3);
    setAmb(); on && setTimeout(() => play("click"), 30);
  };
  window.__sfx = { play, get on() { return on; }, get ctx() { return ctx; } };
})();
