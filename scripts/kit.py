#!/usr/bin/env python3
"""微縮世界式導覽網站工具箱
用法：
  python3 kit.py check   內容.xlsx                      # 檢查欄位、字數、參照、數據四件套
  python3 kit.py build   內容.xlsx 輸出資料夾 [--engine engine.html]   # xlsx → index.html
  python3 kit.py md      內容.xlsx                      # 轉成六張 Markdown 表（貼到小幫手頁面用）
  python3 kit.py shoot   輸出資料夾/index.html 截圖資料夾 [--steps 0,3] [--mobile] [--play]
也可 import：from kit import write_xlsx
"""
import sys, os, re, json, argparse
from openpyxl import Workbook, load_workbook
from openpyxl.styles import PatternFill, Font, Alignment

SHEETS = ["1_全站設定", "2_類別表", "3_步驟表", "4_實體表", "5_動態元素表", "6_來源表"]
def sc(n): return [f"數據{n}{x}" for x in ("數值", "單位", "標籤", "年份", "來源")]
HEAD = {
    "1_全站設定": ["標題", "副標", "開場標語", "導言", "記得的事1", "記得的事2", "記得的事3", "收束結語", "聯絡方式", "隱喻世界", "品牌色", "範本"],
    "2_類別表": ["代號", "名稱", "識別色", "一句話定位", "隱喻造型", "地面", "邊界"],
    "3_步驟表": ["順序", "類別代號", "實體代號", "宣告標題", "宣告副句"] + sc(1) + sc(2) + sc(3) + ["案例類型", "案例內容", "說明文字", "圖片檔名"],
    "4_實體表": ["代號", "名稱", "類別代號", "一句話亮點"] + sc(1) + sc(2) + ["簡介", "沿革", "怎麼使用／申請", "資源1名稱", "資源1連結", "資源2名稱", "資源2連結", "資源3名稱", "資源3連結", "聯絡窗口", "圖片檔名"],
    "5_動態元素表": ["名稱", "象徵什麼", "出現位置", "地標文字"],
    "6_來源表": ["來源代號", "來源名稱", "連結", "年份", "算法說明", "提供人"],
}
REQ = {
    "1_全站設定": ["標題", "開場標語", "導言", "收束結語"],
    "2_類別表": ["代號", "名稱", "識別色"],
    "3_步驟表": ["順序", "類別代號", "實體代號", "宣告標題", "說明文字"],
    "4_實體表": ["代號", "名稱", "類別代號", "一句話亮點", "簡介"],
    "5_動態元素表": ["名稱", "象徵什麼"],
    "6_來源表": ["來源代號", "來源名稱", "年份"],
}
LIM = {  # (最少, 最多) 字數；0 代表不限下限
    "1_全站設定": {"標題": (0, 15), "開場標語": (0, 25), "導言": (60, 100), "記得的事1": (0, 20), "記得的事2": (0, 20), "記得的事3": (0, 20), "收束結語": (60, 100)},
    "3_步驟表": {"宣告標題": (0, 12), "宣告副句": (0, 25), "案例內容": (40, 60), "說明文字": (80, 150)},
    "4_實體表": {"一句話亮點": (0, 28), "簡介": (50, 90), "沿革": (0, 60)},
}
YEL = PatternFill("solid", fgColor="FFF2B3")   # 推論／待確認
HDR = PatternFill("solid", fgColor="25313B")

def _s(v):
    if v is None: return ""
    if isinstance(v, float) and v.is_integer(): v = int(v)
    return str(v).strip()

def write_xlsx(content, path):
    """content = {工作表名: [列dict, ...]}；列 dict 的鍵是欄位名；
    列內可加 "_inf": [欄位名, ...] 標示「推論／待確認」的格子（會塗黃）。第一張表可直接給一個 dict。"""
    wb = Workbook(); wb.remove(wb.active)
    for name in SHEETS:
        ws = wb.create_sheet(name); heads = HEAD[name]; ws.append(heads)
        for c in ws[1]:
            c.fill = HDR; c.font = Font(bold=True, color="FFFFFF"); c.alignment = Alignment(vertical="center")
            if heads[c.column - 1] in REQ.get(name, []): c.value = heads[c.column - 1]; c.font = Font(bold=True, color="FFD27A")
        rows = content.get(name, [])
        if isinstance(rows, dict): rows = [rows]
        for r in rows:
            ws.append([_s(r.get(h)) if r.get(h) is not None else None for h in heads])
            for h in r.get("_inf", []):
                if h in heads: ws.cell(row=ws.max_row, column=heads.index(h) + 1).fill = YEL
        for i, h in enumerate(heads, 1):
            ws.column_dimensions[ws.cell(row=1, column=i).column_letter].width = 36 if h in ("導言", "收束結語", "案例內容", "說明文字", "簡介", "沿革", "怎麼使用／申請", "算法說明") else 16
        for row in ws.iter_rows(min_row=2):
            for c in row: c.alignment = Alignment(wrap_text=True, vertical="top")
        ws.freeze_panes = "B2"
    wb.save(path); return path

def read_xlsx(path):
    wb = load_workbook(path, data_only=True); out = {}
    for name in SHEETS:
        if name not in wb.sheetnames: out[name] = []; continue
        ws = wb[name]; rows = list(ws.iter_rows(values_only=True))
        if not rows: out[name] = []; continue
        heads = [_s(h) for h in rows[0]]; lst = []
        for r in rows[1:]:
            d = {h: _s(v) for h, v in zip(heads, r) if h}
            if any(d.values()): lst.append(d)
        out[name] = lst
    return out

def check(path):
    X = read_xlsx(path); E, W, I = [], [], []
    for name in SHEETS:
        for n, r in enumerate(X[name], 2):
            for f in REQ.get(name, []):
                if not r.get(f): E.append(f"{name} 第{n}列：必填欄位「{f}」是空的")
            for f, (lo, hi) in LIM.get(name, {}).items():
                v = r.get(f, "")
                if v and (len(v) > hi or len(v) < lo): W.append(f"{name} 第{n}列「{f}」{len(v)} 字（建議 {lo or ''}–{hi}）")
    if len(X["1_全站設定"]) != 1: E.append("1_全站設定 應該只有一列")
    cats = {r["代號"] for r in X["2_類別表"] if r.get("代號")}; ents = {r["代號"] for r in X["4_實體表"] if r.get("代號")}
    srcs = {r["來源代號"] for r in X["6_來源表"] if r.get("來源代號")}
    for r in X["2_類別表"]:
        if r.get("識別色") and not re.fullmatch(r"#[0-9a-fA-F]{6}", r["識別色"]): E.append(f"類別「{r.get('名稱')}」識別色要是 #RRGGBB")
    for r in X["3_步驟表"]:
        if r.get("類別代號") and r["類別代號"] not in cats: E.append(f"步驟 {r.get('順序')}：類別代號「{r['類別代號']}」不在類別表")
        if r.get("實體代號") and r["實體代號"] not in ents: E.append(f"步驟 {r.get('順序')}：實體代號「{r['實體代號']}」不在實體表")
    for r in X["4_實體表"]:
        if r.get("類別代號") and r["類別代號"] not in cats: E.append(f"實體「{r.get('名稱')}」：類別代號「{r['類別代號']}」不在類別表")
    def quad(tag, r, k):
        v = [r.get(f"數據{k}{x}", "") for x in ("數值", "單位", "標籤", "年份", "來源")]
        if any(v) and not all(v):
            miss = [x for x, y in zip(("數值", "單位", "標籤", "年份", "來源"), v) if not y]; I.append(f"{tag} 數據{k}缺「{'、'.join(miss)}」→ 網站上會自動隱藏")
        if v[4] and v[4] not in srcs: E.append(f"{tag} 數據{k}：來源代號「{v[4]}」不在來源表")
    for r in X["3_步驟表"]:
        for k in (1, 2, 3): quad(f"步驟 {r.get('順序')}", r, k)
    for r in X["4_實體表"]:
        for k in (1, 2): quad(f"實體「{r.get('名稱')}」", r, k)
    import re as _re
    for r in X["2_類別表"]:
        g, ed = r.get("地面", ""), r.get("邊界", "")
        if g and not _re.search("磚|草|木|地板|brick|grass|wood", g, _re.I): W.append(f"類別「{r.get('名稱')}」的地面「{g}」我不認得，會改用自動搭配（可以寫：紅磚、草地、木地板）")
        if ed and not _re.search("籬|綠|柵|木|混|原|無|hedge|fence|mix|plain|none", ed, _re.I): W.append(f"類別「{r.get('名稱')}」的邊界「{ed}」我不認得，會改用自動搭配（可以寫：綠籬、木柵欄、原樣、混搭）")
        m = sum(1 for e in X["4_實體表"] if e.get("類別代號") == r.get("代號"))
        if m > 6: W.append(f"類別「{r.get('名稱')}」有 {m} 個項目，一座島最多放 6 個項目；超過 6 個太擠，建議拆成兩個分類")
    if not 4 <= len(cats) <= 6: W.append(f"類別有 {len(cats)} 個（建議 4–6，超過 7 個讀者記不住顏色）")
    if not 6 <= len(X["3_步驟表"]) <= 12: W.append(f"步驟有 {len(X['3_步驟表'])} 步（建議 6–12）")
    if not 8 <= len(X["5_動態元素表"]) <= 12: W.append(f"動態元素有 {len(X['5_動態元素表'])} 項（建議 8–12）")
    used = {r.get("實體代號") for r in X["3_步驟表"]}
    I.append("沒出現在導覽主線、只能點開看的實體：" + "、".join(r["名稱"] for r in X["4_實體表"] if r["代號"] not in used) if ents - used else "所有實體都有出現在導覽主線")
    for t, L in (("錯誤（必須修）", E), ("提醒（建議修）", W), ("資訊", I)):
        print(f"\n【{t}】{len(L)}"); [print(" -", x) for x in L]
    return not E

def to_md(path):
    """把 xlsx 轉成六張 Markdown 表（B 流程與小幫手頁面可直接貼用）"""
    X = read_xlsx(path); out = []
    for name in SHEETS:
        heads = HEAD[name]; out.append(f"## {name}\n"); out.append("| " + " | ".join(heads) + " |"); out.append("|" + "---|" * len(heads))
        for r in X[name]: out.append("| " + " | ".join(r.get(h, "").replace("|", "／").replace("\n", " ") for h in heads) + " |")
        out.append("")
    return "\n".join(out)

def to_data(path):
    X = read_xlsx(path); s = X["1_全站設定"][0] if X["1_全站設定"] else {}
    def stat(r, k): return {"value": r.get(f"數據{k}數值", ""), "unit": r.get(f"數據{k}單位", ""), "label": r.get(f"數據{k}標籤", ""), "year": r.get(f"數據{k}年份", ""), "src": r.get(f"數據{k}來源", "")}
    steps = sorted(X["3_步驟表"], key=lambda r: float(r.get("順序") or 0))
    return {
        "site": {"title": s.get("標題", ""), "subtitle": s.get("副標", ""), "tagline": s.get("開場標語", ""), "intro": s.get("導言", ""),
                 "remember": [s.get(f"記得的事{i}", "") for i in (1, 2, 3)], "outro": s.get("收束結語", ""), "cta": s.get("聯絡方式", ""),
                 "metaphor": s.get("隱喻世界", ""), "brandColor": s.get("品牌色", ""), "template": s.get("範本", "") or "town"},
        "categories": [{"id": r["代號"], "name": r["名稱"], "color": r["識別色"], "pitch": r.get("一句話定位", ""), "shape": r.get("隱喻造型", ""), "ground": r.get("地面", ""), "edge": r.get("邊界", "")} for r in X["2_類別表"]],
        "steps": [{"cat": r["類別代號"], "entity": r["實體代號"], "headline": r["宣告標題"], "sub": r.get("宣告副句", ""), "stats": [stat(r, k) for k in (1, 2, 3)],
                   "caseType": r.get("案例類型", ""), "caseText": r.get("案例內容", ""), "body": r.get("說明文字", ""), "image": r.get("圖片檔名", "")} for r in steps],
        "entities": [{"id": r["代號"], "name": r["名稱"], "cat": r["類別代號"], "highlight": r.get("一句話亮點", ""), "stat1": stat(r, 1), "stat2": stat(r, 2),
                      "intro": r.get("簡介", ""), "history": r.get("沿革", ""), "howto": r.get("怎麼使用／申請", ""),
                      "resources": [{"name": r.get(f"資源{i}名稱", ""), "url": r.get(f"資源{i}連結", "")} for i in (1, 2, 3)],
                      "contact": r.get("聯絡窗口", ""), "image": r.get("圖片檔名", "")} for r in X["4_實體表"]],
        "dynamics": [{"name": r["名稱"], "meaning": r.get("象徵什麼", ""), "near": r.get("出現位置", ""), "label": r.get("地標文字", "")} for r in X["5_動態元素表"]],
        "sources": [{"id": r["來源代號"], "name": r["來源名稱"], "url": r.get("連結", ""), "year": r.get("年份", ""), "method": r.get("算法說明", ""), "provider": r.get("提供人", "")} for r in X["6_來源表"]],
    }

def build(xlsx, outdir, engine="engine.html"):
    data = to_data(xlsx); os.makedirs(os.path.join(outdir, "images"), exist_ok=True)
    html = open(engine, encoding="utf-8").read()
    js = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    open(os.path.join(outdir, "index.html"), "w", encoding="utf-8").write(html.replace("__SITE_DATA__", js))
    names = sorted({x["image"] for x in data["steps"] + data["entities"] if x.get("image")})
    open(os.path.join(outdir, "images", "請把圖片放這裡.txt"), "w", encoding="utf-8").write("把圖片（建議 16:10）以下列檔名放進這個資料夾，網站會自動帶出；沒放的圖會自動隱藏：\n" + "\n".join(names) + "\n")
    json.dump(data, open(os.path.join(outdir, "content.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("已輸出", os.path.join(outdir, "index.html")); return data

def shoot(index, shotdir, steps=None, mobile=False, play=False):
    from playwright.sync_api import sync_playwright
    import pathlib
    os.makedirs(shotdir, exist_ok=True); errs = []
    ext = []
    def route(r):
        u = r.request.url
        if u.startswith(("file:", "data:", "blob:")): return r.continue_()
        ext.append(u); r.abort()
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
        def page(w, h):
            pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=1); pg.route("**/*", route)
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_FAILED" not in m.text else None); pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(pathlib.Path(index).resolve().as_uri()); pg.wait_for_function("window.__tour", timeout=30000); pg.wait_for_timeout(1500); return pg
        pg = page(1440, 900); n = pg.evaluate("__tour.steps.length"); idx = steps or [min(2, n - 1)]
        pg.screenshot(path=f"{shotdir}/1_全景.png")
        for k, i in enumerate(idx):
            pg.evaluate(f"__tour.goStep({i});__tour.next()"); pg.wait_for_timeout(1600)
            pg.screenshot(path=f"{shotdir}/2_第{i+1}步演出.png")
        eid = pg.evaluate(f"__tour.steps[{idx[0]}].entity"); pg.evaluate(f"__tour.openCard('{eid}')"); pg.wait_for_timeout(2600)
        pg.screenshot(path=f"{shotdir}/3_資訊卡.png"); pg.evaluate("__tour.closeCard()")
        if play:
            for i in range(n):
                pg.evaluate(f"__tour.goStep({i})"); pg.wait_for_timeout(300); pg.evaluate("__tour.next()"); pg.wait_for_timeout(250)
            pg.evaluate("__tour.showEnd()"); pg.wait_for_timeout(500); pg.screenshot(path=f"{shotdir}/4_結尾.png")
        pg.close()
        if mobile or play:
            m = page(390, 844)
            m.screenshot(path=f"{shotdir}/5_手機全景.png"); m.evaluate(f"__tour.goStep({idx[0]});__tour.next()"); m.wait_for_timeout(1600)
            m.screenshot(path=f"{shotdir}/6_手機演出.png"); m.close()
        b.close()
    print("截圖完成：", shotdir); print("主控台錯誤：", errs if errs else "無"); print("外連請求：", sorted(set(ext)) if ext else "無（可離線開啟）"); return not errs and not ext

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("cmd", choices=["check", "build", "shoot", "md"]); ap.add_argument("a"); ap.add_argument("b", nargs="?")
    ap.add_argument("--engine", default="engine.html"); ap.add_argument("--steps"); ap.add_argument("--mobile", action="store_true"); ap.add_argument("--play", action="store_true")
    g = ap.parse_args()
    if g.cmd == "check": sys.exit(0 if check(g.a) else 1)
    if g.cmd == "md": print(to_md(g.a))
    if g.cmd == "build": build(g.a, g.b, g.engine)
    if g.cmd == "shoot": sys.exit(0 if shoot(g.a, g.b, [int(x) for x in g.steps.split(",")] if g.steps else None, g.mobile, g.play) else 1)
