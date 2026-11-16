"""引擎測試：python3 test_engine.py ..   （參數是 skill 根目錄）
檢查：3 個項目以下的島外觀與原版 v4 一致；4 個以上的島高低錯落、全景只顯示分類名。"""
import sys, pathlib, subprocess, tempfile, json
from playwright.sync_api import sync_playwright
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "..").resolve()
kit = root / "scripts/kit.py"; tmp = pathlib.Path(tempfile.mkdtemp())
def build(xlsx, eng, name):
    subprocess.run([sys.executable, str(kit), "build", str(xlsx), str(tmp / name), "--engine", str(eng)], check=True, capture_output=True)
    return (tmp / name / "index.html").as_uri()
GEO = """()=>{const t=window.__tour,o=[];t.scene.updateMatrixWorld(true);t.scene.traverse(m=>{if(m.isMesh&&m.userData&&m.userData.eid){const p=new t.THREE.Vector3();m.getWorldPosition(p);o.push([m.userData.eid,m.geometry.type,+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2),JSON.stringify(m.geometry.parameters||{})])}});o.sort((a,b)=>JSON.stringify(a)<JSON.stringify(b)?-1:1);return o}"""
fails = []
def check(ok, msg):
    print(("PASS " if ok else "FAIL ") + msg); (not ok) and fails.append(msg)
ex = root / "examples/範例內容.xlsx"; fx = root / "maint/fixtures/多項目島_測試資料.xlsx"
u_new = build(ex, root / "assets/engine.html", "a"); u_old = build(ex, root / "maint/engine.v4.original.html", "b"); u_fx = build(fx, root / "assets/engine.html", "c")
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    def open_(u):
        pg = b.new_page(viewport={"width": 1280, "height": 800}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.goto(u, wait_until="commit", timeout=90000); pg.wait_for_timeout(5000); return pg, errs
    pa, ea = open_(u_new); pb, eb = open_(u_old)
    check(pa.evaluate(GEO) == pb.evaluate(GEO), "3 個以下的島：建築與原版 v4 完全一致")
    check(pa.evaluate("()=>document.querySelectorAll('.catlb').length") == 0, "沒有擠的島：不出現分類標籤")
    pc, ec = open_(u_fx)
    check(pc.evaluate("()=>document.querySelectorAll('.catlb').length") >= 1, "4 個以上的島：有分類標籤")
    check(pc.evaluate("()=>[...document.querySelectorAll('.lb[data-crowd]')].every(e=>getComputedStyle(e).display==='none')"), "全景：擠的島只顯示分類名，建築標籤隱藏")
    rows = pc.evaluate(GEO)
    sig = {}; top = {}
    for r in rows:
        sig.setdefault(r[0], set()).add(r[1]); top[r[0]] = max(top.get(r[0], 0), r[3])
    crowd = [e for e in ("e3", "e4", "e5", "e6", "e14", "e15") if e in sig]
    kinds = {tuple(sorted(sig[e])) for e in crowd}
    check(len(kinds) >= 3, f"6 個項目的島：建築造型有 {len(kinds)} 種（需 ≥3）")
    check(len({round(top[e], 1) for e in crowd}) >= 5, "6 個項目的島：建築高度至少 5 種")
    pc.evaluate("()=>window.__tour.focusIsland(1)"); pc.wait_for_timeout(2500)
    check(pc.evaluate("()=>[...document.querySelectorAll('.lb[data-crowd]')].some(e=>getComputedStyle(e).display!=='none')"), "聚焦該島：建築標籤出現")
    for n, e in (("新引擎", ea), ("對照", eb), ("多項目", ec)): check(not e, f"{n}：主控台無錯誤 {e[:1]}")
    b.close()
print("\n失敗：", fails or "無"); sys.exit(1 if fails else 0)
