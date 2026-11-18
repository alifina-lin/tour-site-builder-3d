"""把大樓與市集版型、共用人群模組、關於本站併入 v4.1 引擎（記錄用）：python3 integrate_tower.py 原始engine.html 輸出engine.html
讀 engine-source/ 的 crowd-kit.js、tower-template.js、market-template.js、tower-theme.js、tower.css、market.css。只能套用在尚未併入的 v4.1 引擎上。"""
import sys, pathlib
here = pathlib.Path(__file__).parent / 'engine-source'
src = pathlib.Path(sys.argv[1]); dst = pathlib.Path(sys.argv[2])
s = src.read_text(encoding='utf-8')
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)
tpl = (here/'crowd-kit.js').read_text(encoding='utf-8') + '\n' + (here/'tower-template.js').read_text(encoding='utf-8') + '\n' + (here/'market-template.js').read_text(encoding='utf-8')
theme = (here/'tower-theme.js').read_text(encoding='utf-8')
css = (here/'tower.css').read_text(encoding='utf-8')
mcss = (here/'market.css').read_text(encoding='utf-8')
# 1) 版型：加入科技大樓，中文名稱也能用；body 加上版型 class
rep('var dM = Hc[Ge.site.template] || Hc.town,', tpl + '''
/* 版型代號：英文代號或中文名稱都可以；不認得的一律用六角群島 */
Hc["小島"] = Hc["六角群島"] = Hc.islands;
Hc["大樓"] = Hc["科技大樓"] = Hc.tower;
Hc["市集"] = Hc.market;
Hc.islands.name = "小島";
var tplKey = String(Ge.site.template || "").trim(),
  tplName = (Hc[tplKey] || Hc.town) === Hc.tower ? "tower" : (Hc[tplKey] || Hc.town) === Hc.market ? "market" : "islands";
document.body.classList.add("tpl-" + tplName);
var dM = Hc[tplKey] || Hc.town,''')
rep('window.__tour = {', 'window.__tour = {\n  tpl: tplName,')
# 1b) 島嶼「擠的島只顯示分類名」標籤：科技大樓有自己的樓層標籤，不需要
rep('  if (!crowdCat[c.id] || !Ke.isl || !Ke.isl[i]) return;', '  if (!crowdCat[c.id] || !Ke.isl || !Ke.isl[i] || Ke.noCatLabels) return;')
# 1c) 導言最後加 info 圖示，點了開「關於本站」
rep('Dt("#lead").textContent = Ge.site.intro || "";', '''Dt("#lead").textContent = Ge.site.intro || "";
/* 關於本站：導言最後的 info 圖示 */
(function () {
  var HELPER_URL = "https://alifina-lin.github.io/tour-site-builder-3d/";
  var b = document.createElement("button");
  b.type = "button";
  b.className = "aboutb";
  b.title = "關於本站";
  b.setAttribute("aria-label", "關於本站");
  b.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.2"/></svg>';
  Dt("#lead").appendChild(b);
  var ov = document.createElement("div");
  ov.className = "ov";
  ov.id = "aboutov";
  ov.innerHTML = '<div class="glass" id="aboutcard" role="dialog" aria-modal="true" aria-labelledby="about-h"><button class="x" id="about-x" aria-label="關閉">×</button><h2 class="serif" id="about-h">關於本站</h2><p id="about-p"></p><p class="aboutl"><a id="about-a" target="_blank" rel="noopener"></a></p></div>';
  document.body.appendChild(ov);
  var t = document.createElement("b");
  t.textContent = Ge.site.title || "這裡";
  ov.querySelector("#about-p").append("本站使用「NCCU 3D導覽網站小幫手」創建，帶大家走進", t, "的小世界。");
  var a = ov.querySelector("#about-a");
  a.href = HELPER_URL;
  a.textContent = "NCCU 3D導覽網站小幫手";
  var close = function () { ov.classList.remove("on"); };
  b.onclick = function (e) { e.stopPropagation(); ov.classList.add("on"); ov.querySelector("#about-x").focus(); };
  ov.querySelector("#about-x").onclick = close;
  ov.addEventListener("click", function (e) { e.target === ov && close(); });
  addEventListener("keydown", function (e) { e.key === "Escape" && close(); });
})();''')
rep('<style id="theme-css">', '<style id="about-css">\n.aboutb{display:inline-grid;place-items:center;width:22px;height:22px;margin-left:6px;vertical-align:-5px;border:0;padding:0;border-radius:50%;background:rgba(37,49,59,.08);color:var(--ink);cursor:pointer}.aboutb:hover{background:rgba(37,49,59,.16)}.aboutb svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}\nbody.night .aboutb{background:rgba(160,200,235,.14)}\n#aboutcard{width:min(440px,calc(100vw - 28px));padding:24px 26px 20px}#aboutcard h2{margin:0 0 10px;font-size:22px;letter-spacing:.04em;font-weight:900}#aboutcard p{margin:0 0 10px}#aboutcard .aboutl a{color:var(--accent);font-weight:700}\n#aboutcard .x{float:right;border:0;background:rgba(37,49,59,.08);width:30px;height:30px;border-radius:9px;cursor:pointer;font-size:16px;color:var(--ink)}\n</style>\n<style id="theme-css">')

# 2) 修正點選偏移：setViewOffset 已經把側欄位移算進投影，滑鼠座標不需再加
rep('''    Ae.view &&
      Ae.view.enabled &&
      Ju.set(
        ((s.clientX + Ae.view.offsetX) / Ae.view.fullWidth) * 2 - 1,
        -((s.clientY + Ae.view.offsetY) / Ae.view.fullHeight) * 2 + 1,
      ),
''', '')
rep('''  Ae.view &&
    Ae.view.enabled &&
    Ju.set(((s.clientX + Ae.view.offsetX) / Ae.view.fullWidth) * 2 - 1, -((s.clientY + Ae.view.offsetY) / Ae.view.fullHeight) * 2 + 1);
''', '')
# 3) 島嶼專用的日夜裝飾層：只在六角群島執行
rep('<script type="module" id="theme-decor">\n/* ==== 日夜主題裝飾層：海面、雲、鳥、帆船、天燈、光線、霧；依電腦時間自動切換，也可手動切換 ==== */\n(() => {',
    '<script type="module" id="theme-decor">\n/* ==== 日夜主題裝飾層：海面、雲、鳥、帆船、天燈、光線、霧；依電腦時間自動切換，也可手動切換（六角群島專用）==== */\n(() => {\n  if (!document.body.classList.contains("tpl-islands")) return;')
# 4) 科技大樓的日夜模組與樣式（只在科技大樓執行）
theme = theme.replace('(() => {\n  const T = window.__tour;', '(() => {\n  if (!document.body.classList.contains("tpl-tower") && !document.body.classList.contains("tpl-market")) return;\n  const T = window.__tour;', 1)
assert 'tpl-market")) return;' in theme
rep('<script type="module" id="sound">', '<style id="tower-css">\n/* ===== 科技大樓專用樣式（只套用在 body.tpl-tower）===== */\n' + css + '</style>\n<style id="market-css">\n/* ===== 市集專用樣式（只套用在 body.tpl-market）===== */\n' + mcss + '</style>\n<script type="module" id="tower-theme">\n' + theme + '</script>\n<script type="module" id="sound">')
# 5) 環境音：科技大樓改為安靜的空調底噪，不放鳥鳴蟲鳴
rep('<script type="module" id="sound">\n/* ==== 即時合成音效（Web Audio）：按鈕、光柱、翻卡、故事飛入；全景時淡淡的水聲、風聲、鳥鳴（夜晚換成蟲鳴）==== */\n(() => {',
    '<script type="module" id="sound">\n/* ==== 即時合成音效（Web Audio）：按鈕、光柱、翻卡、故事飛入；全景時淡淡的水聲、風聲、鳥鳴（夜晚換成蟲鳴）；科技大樓是車行聲加零星人聲、市集是人群嘈雜聲加鳥鳴 ==== */\n(() => {\n  const TOWER = document.body.classList.contains("tpl-tower"),\n    MARKET = document.body.classList.contains("tpl-market");')
rep('birdLoop(); cricketLoop();', 'if (!TOWER) { birdLoop(); cricketLoop(); }\n    if (TOWER || MARKET) crowdLoop();\n    if (TOWER) carLoop();')
# 人聲與車聲（全景、分區時；導覽中靜音）
rep('  /* ---------- 事件串接 ---------- */', '''  /* ---------- 人聲（市集：熱鬧嘈雜；科技大樓：零星）與車聲（科技大樓）---------- */
  const babble = (t0, pan, v) => {
    // 一小段帶通噪音 ≈ 一個音節；很多段疊在一起就是遠遠的人聲
    const d = 0.07 + Math.random() * 0.2, src = ctx.createBufferSource();
    src.buffer = white;
    const f1 = ctx.createBiquadFilter(); f1.type = "bandpass"; f1.Q.value = 6;
    f1.frequency.setValueAtTime(320 + Math.random() * 520, t0);
    f1.frequency.linearRampToValueAtTime(280 + Math.random() * 700, t0 + d);
    const f2 = ctx.createBiquadFilter(); f2.type = "bandpass"; f2.Q.value = 7; f2.frequency.value = 1000 + Math.random() * 1100;
    const g = envG(t0, 0.02, v, d), g2 = ctx.createGain(); g2.gain.value = 0.45;
    src.connect(f1); f1.connect(g); src.connect(f2); f2.connect(g2); g2.connect(g);
    out(g, pan, 0.3, amb);
    src.start(t0, Math.random() * 3); src.stop(t0 + d + 0.12);
  };
  const crowdLoop = () => {
    if (ambActive()) {
      const n = MARKET ? 3 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) babble(ctx.currentTime + 0.02 + Math.random() * 0.3, Math.random() * 1.6 - 0.8, (MARKET ? 0.6 : 0.3) * (0.5 + Math.random()) * (night ? 0.8 : 1));
    }
    setTimeout(crowdLoop, MARKET ? 110 + Math.random() * 130 : 380 + Math.random() * 700);
  };
  const carPass = (t0) => {
    // 一台車由一側開到另一側：低頻噪音加引擎聲，濾波與音量先升後降，聲像左右移動
    const dur = 2.4 + Math.random() * 1.8, dir = Math.random() < 0.5 ? -1 : 1, peak = 0.45 + Math.random() * 0.25;
    const src = ctx.createBufferSource(); src.buffer = brown;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(240, t0); lp.frequency.linearRampToValueAtTime(950, t0 + dur * 0.5); lp.frequency.linearRampToValueAtTime(220, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(lp); lp.connect(g);
    const p = out(g, -0.85 * dir, 0.12, amb);
    p.pan.setValueAtTime(-0.85 * dir, t0); p.pan.linearRampToValueAtTime(0.85 * dir, t0 + dur);
    const o = ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(75 + Math.random() * 30, t0); o.frequency.linearRampToValueAtTime(58 + Math.random() * 15, t0 + dur);
    const ol = ctx.createBiquadFilter(); ol.type = "lowpass"; ol.frequency.value = 170;
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t0); og.gain.exponentialRampToValueAtTime(peak * 0.25, t0 + dur * 0.5); og.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(ol); ol.connect(og); og.connect(p);
    src.start(t0, Math.random() * 2); src.stop(t0 + dur + 0.1); o.start(t0); o.stop(t0 + dur + 0.1);
  };
  const carLoop = () => {
    if (ambActive()) {
      carPass(ctx.currentTime + 0.05);
      Math.random() < 0.3 && carPass(ctx.currentTime + 0.8 + Math.random());
    }
    setTimeout(carLoop, (night ? 6000 : 3500) + Math.random() * 5000);
  };

  /* ---------- 事件串接 ---------- */''')
rep('wl.frequency.value = 480', 'wl.frequency.value = TOWER ? 170 : MARKET ? 600 : 480')
rep('lfo(0.085, 0.28, wg.gain, 0.55)', 'lfo(TOWER ? 0.05 : MARKET ? 0.13 : 0.085, TOWER ? 0.02 : MARKET ? 0.03 : 0.28, wg.gain, TOWER ? 0.12 : MARKET ? 0.1 : 0.55)')
rep('lfo(0.07, 0.025, sg.gain, 0.03)', 'lfo(0.07, TOWER || MARKET ? 0.004 : 0.025, sg.gain, TOWER || MARKET ? 0.008 : 0.03)')
rep('lfo(0.045, 260, fb.frequency, 560)', 'lfo(0.045, TOWER ? 160 : 260, fb.frequency, TOWER ? 900 : 560)')
assert s.count('__SITE_DATA__') == 1
dst.write_text(s, encoding='utf-8'); print('engine ok', round(len(s.encode())/1024), 'KB')
