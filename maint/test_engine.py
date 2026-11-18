"""引擎測試：python3 test_engine.py ..   （參數是 skill 根目錄）
檢查：3 個項目以下的島外觀與原版 v4 一致；4 個以上的島高低錯落、全景只顯示分類名；
科技大樓版型：範本代號、樓層與標籤、進樓層時上方樓層移開、側欄打開時點得準；
市集版型：範本代號、分區與標籤、攤位數、導覽進到攤位、點攤位點得準。"""
import sys, pathlib, subprocess, tempfile, json
from playwright.sync_api import sync_playwright
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "..").resolve()
kit = root / "scripts/kit.py"; tmp = pathlib.Path(tempfile.mkdtemp())
def build_tpl(xlsx, tpl, name):
    import openpyxl
    wb = openpyxl.load_workbook(xlsx); ws = wb["1_全站設定"]
    col = [c.value for c in ws[1]].index("範本") + 1; ws.cell(2, col).value = tpl
    x = tmp / (name + ".xlsx"); wb.save(x)
    return build(x, root / "assets/engine.html", name)
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
    # ---- 科技大樓版型 ----
    check(pa.evaluate("()=>window.__tour.tpl")=="islands" and pa.evaluate("()=>document.body.classList.contains('tpl-islands')"), "範本空白或 town：使用六角群島")
    for name, val in (("大樓", "大樓"), ("科技大樓（舊名）", "科技大樓"), ("tower", "tower")):
        u = build_tpl(fx, val, "tw_" + val)
        pt, et = open_(u)
        check(pt.evaluate("()=>window.__tour.tpl")=="tower" and pt.evaluate("()=>document.body.classList.contains('tpl-tower')"), f"範本填「{name}」：使用科技大樓")
        n_cat = pt.evaluate("()=>window.__tour.W.floors.length"); n_tag = pt.evaluate("()=>document.querySelectorAll('#ftags .ftag').length")
        check(n_cat >= 3 and n_tag == n_cat, f"科技大樓：每個分類一層樓、每層一個標籤（{n_cat} 層、{n_tag} 個標籤）")
        check(pt.evaluate("()=>!document.querySelector('.catlb')"), "科技大樓：沒有島嶼專用的分類標籤")
        if val == "tower":
            pt.evaluate("()=>window.__tour.focusIsland(1)"); pt.wait_for_timeout(9000)
            st = pt.evaluate("()=>({m:window.__tour.S.mode,i:window.__tour.S.isl,lift:window.__tour.W.floors.map(f=>f.lift>0.9)})")
            check(st["m"]=="island" and st["i"]==1 and all(st["lift"][2:]) and not any(st["lift"][:2]), "科技大樓：進到 2F 時上方樓層移開、下方保留")
            # 點房間（不經由程式呼叫，模擬滑鼠）：側欄打開時也要點得準
            it = pt.evaluate("()=>{const T=window.__tour,f=T.W.floors[1],e=f.ents[0],i=T.W.items[e.id];const v=new T.THREE.Vector3(i.cx,i.y+0.5,i.cz).project(T.camera);return [e.id,(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]}")
            pt.mouse.click(it[1], it[2]); pt.wait_for_timeout(2500)
            check(pt.evaluate("()=>window.__tour.S.cur&&window.__tour.S.cur.entity")==it[0], "科技大樓：側欄打開時點房間，點到的是滑鼠下那一間")
            pt.evaluate("()=>window.__tour.home()"); pt.wait_for_timeout(2500)
            check(not pt.evaluate("()=>document.getElementById('ftags').classList.contains('off')"), "科技大樓：回到全景時樓層標籤出現")
        check(not et, f"科技大樓（{name}）：主控台無錯誤 {et[:1]}")
    # ---- 市集版型 ----
    for name, val in (("市集", "市集"), ("market", "market")):
        u = build_tpl(fx, val, "mk_" + val)
        pm, em = open_(u)
        check(pm.evaluate("()=>window.__tour.tpl")=="market" and pm.evaluate("()=>document.body.classList.contains('tpl-market')"), f"範本填「{name}」：使用市集")
        nb = pm.evaluate("()=>window.__tour.W.blocks.length"); nt = pm.evaluate("()=>document.querySelectorAll('#mtags .mtag').length")
        check(nb >= 3 and nt == nb, f"市集：每個分類一區、每區一個標籤（{nb} 區、{nt} 個標籤）")
        check(pm.evaluate("()=>!document.querySelector('.catlb')"), "市集：沒有島嶼專用的分類標籤")
        if val == "market":
            n_ent = pm.evaluate("()=>Object.keys(window.__tour.W.items).length")
            check(n_ent == pm.evaluate("()=>window.__tour.W.blocks.reduce((a,b)=>a+b.n,0)"), f"市集：每個項目一個攤位（{n_ent} 個）")
            pm.evaluate("()=>window.__tour.next()"); pm.wait_for_timeout(6500)
            st = pm.evaluate("()=>({m:window.__tour.S.mode,e:window.__tour.S.cur&&window.__tour.S.cur.entity})")
            check(st["m"]=="tour" and st["e"] is not None, "市集：開始導覽後進到第一個攤位")
            # 先回到該區的斜看鏡頭（側欄仍開著），再用滑鼠點同一區的另一個攤位
            pm.evaluate("()=>{const T=window.__tour;T.focusIsland(T.W.items[T.S.cur.entity].block)}"); pm.wait_for_timeout(3500)
            it = pm.evaluate("()=>{const T=window.__tour,ids=Object.keys(T.W.items),b=T.S.isl,id=ids.find(k=>T.W.items[k].block===b),i=T.W.items[id];const v=new T.THREE.Vector3(i.x,1.0,i.z+0.8).project(T.camera);return [id,(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]}")
            pm.mouse.click(it[1], it[2]); pm.wait_for_timeout(2500)
            check(pm.evaluate("()=>window.__tour.S.cur&&window.__tour.S.cur.entity")==it[0], "市集：側欄打開時點區內的攤位，點到的是滑鼠下那一個")
            pm.evaluate("()=>window.__tour.home()"); pm.wait_for_timeout(2500)
            check(not pm.evaluate("()=>document.getElementById('mtags').classList.contains('off')"), "市集：回到全景時分區標籤出現")
        check(not em, f"市集（{name}）：主控台無錯誤 {em[:1]}")
    b.close()
print("\n失敗：", fails or "無"); sys.exit(1 if fails else 0)
