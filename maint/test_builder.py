import sys, pathlib, json, re
from playwright.sync_api import sync_playwright
skill = pathlib.Path(sys.argv[1]).resolve(); out = pathlib.Path(sys.argv[2]).resolve(); out.mkdir(exist_ok=True)
page_url = (skill/"assets/builder3d.html").as_uri(); sample = (skill/"examples/範例內容.md").read_text(encoding="utf-8")
fails = []; ext = []; errs = []
def ok(c, m):
    print(("PASS " if c else "FAIL ")+m); 
    if not c: fails.append(m)
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--enable-unsafe-swiftshader"])
    def new(w,h):
        pg = b.new_page(viewport={"width":w,"height":h}, accept_downloads=True)
        pg.route("**/*", lambda r: r.continue_() if r.request.url.startswith(("file:","data:","blob:","about:")) else (ext.append(r.request.url), r.abort()))
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type=="error" and "ERR_FAILED" not in m.text else None)
        pg.goto(page_url); return pg
    pg = new(1440,900)
    ok(pg.is_disabled("#dl"), "一開始下載鈕是停用的")
    ok(pg.title()=="NCCU 3D導覽網站小幫手" and pg.inner_text("h1").strip()=="NCCU 3D導覽網站小幫手", "標題：NCCU 3D導覽網站小幫手")
    ok(pg.query_selector("h1 svg.logo") is not None and "✿" not in pg.inner_text("h1"), "標題前是 3D 圖示")
    pg.click("#about"); pg.wait_for_timeout(200)
    ok(pg.evaluate("document.getElementById('dlg2').open") and "行政諮詢組 Ali 與 Claude Code" in pg.inner_text("#dlg2") and "單機瀏覽或自行上傳到伺服器皆可" in pg.inner_text("#dlg2") and "設計原則" not in pg.inner_text("#dlg2"), "標題右側 info：開啟「關於」視窗且內容完整")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(150)
    pg.click("#how"); pg.wait_for_timeout(200)
    ok(pg.evaluate("document.getElementById('dlg').open"), "點「請 AI 整理…」會開說明視窗")
    ptxt = pg.inner_text("#pt")
    ok(all(("## %d_" % i) in ptxt for i in range(1,7)) and "| 代號 | 名稱 | 識別色 | 一句話定位 | 隱喻造型 | 地面 | 邊界 |" in ptxt, "指令內含六張表標題與一字不差的欄位")
    ok("不要編造" in ptxt and "200 字" in ptxt and "導言 60–100 字" in ptxt, "指令含資訊誠實、說明字數與字數上限")
    pg.click("#cp"); pg.wait_for_timeout(300); ok(pg.inner_text("#cpok").strip()!="", "按複製會有回饋")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200); ok(not pg.evaluate("document.getElementById('dlg').open"), "Esc 可以關閉視窗")
    pg.click("#load"); pg.wait_for_selector("#pv iframe", timeout=10000); pg.wait_for_timeout(3500)
    ok("檢查通過" in pg.inner_text("#msg"), "範例：檢查通過")
    fr = pg.frame_locator("#pv iframe"); fr_ = pg.query_selector("#pv iframe").content_frame(); fr_.wait_for_function("window.__tour!==undefined", timeout=30000); ok(True, "預覽內的 3D 導覽啟動 (__tour)")
    pg.screenshot(path=str(out/"b1_desktop.png"))
    with pg.expect_download() as d: pg.click("#dl")
    dl = d.value; path = out/"dl.html"; dl.save_as(str(path)); html = path.read_text(encoding="utf-8")
    ok(dl.suggested_filename.endswith("_導覽網站.html"), "下載檔名："+dl.suggested_filename)
    ok("__SITE_DATA__" not in html and "電算中心服務小鎮" in html, "下載檔已填入資料")
    # 下載檔離線開啟
    dp = new(1440,900); dp.goto(path.as_uri()); dp.wait_for_function("window.__tour", timeout=30000); ok(True, "下載的網站可獨立開啟")
    # 手機版
    m = new(390,844); m.click("#load"); m.wait_for_timeout(3000)
    ok(m.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1"), "手機：沒有橫向捲動"); m.click("#how"); m.wait_for_timeout(200); ok(m.evaluate("(()=>{const r=document.getElementById('dlg').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})()"), "手機：說明視窗不超出螢幕"); m.keyboard.press("Escape"); m.screenshot(path=str(out/"b2_mobile.png"))
    # 髒資料：Tab 分隔、參照錯誤、惡意字串
    bad = sample.replace("| e2 |","| e9 |",1) if "| e2 |" in sample else sample
    pg.evaluate("t => window.__b.setText(t)", bad.replace("e1","eX",1)); pg.wait_for_timeout(300)
    msg = pg.inner_text("#msg"); ok("要處理" in msg and pg.is_disabled("#dl"), "參照錯誤：顯示「要處理」並停用下載"); print("   ", msg[:200].replace("\n"," / "))
    pg.evaluate("window.__b.setText('')"); pg.wait_for_timeout(200)
    ok(pg.is_disabled("#dl"), "清空後回到初始狀態")
    # TSV (Excel 複製)
    rows = []
    for blk in re.split(r"(?m)^## ", sample)[1:]:
        title, rest = blk.split("\n",1); lines=[l for l in rest.splitlines() if l.startswith("|") and not re.match(r"^\|[-|]+$", l)]
        rows.append("## "+title+"\n"+"\n".join("\t".join(c.strip() for c in l.strip().strip("|").split("|")) for l in lines))
    pg.evaluate("t => window.__b.setText(t)", "\n\n".join(rows)); pg.wait_for_timeout(3000)
    ok("檢查通過" in pg.inner_text("#msg"), "Tab 分隔（Excel 複製）也能讀")
    evil = sample.replace("電算中心服務小鎮","<img src=x onerror=window.__pwn=1></script><script>window.__pwn=1</script>",1)
    pg.evaluate("t => window.__b.setText(t)", evil); pg.wait_for_timeout(3500)
    fe = pg.query_selector("#pv iframe").content_frame(); fe.wait_for_function("window.__tour!==undefined", timeout=30000)
    ok(not pg.evaluate("window.__pwn===1") and not fe.evaluate("window.__pwn===1"), "惡意字串不會執行"); ok(True, "惡意字串下網站仍正常")
    ok(not ext, "沒有外連請求 "+str(ext)); ok(not errs, "主控台無錯誤 "+str(errs[:3]))
    b.close()
print("\n失敗：", fails if fails else "無"); sys.exit(1 if fails else 0)
