#!/usr/bin/env python3
"""維護者工具：把 builder.src.html + assets/engine.html + 範例表格 組成單檔 assets/builder3d.html（小幫手頁面）"""
import json, sys, pathlib
here = pathlib.Path(__file__).resolve().parent
skill = pathlib.Path(sys.argv[1])
def js(v): return json.dumps(v, ensure_ascii=False).replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
src = (here / "builder.src.html").read_text(encoding="utf-8")
engine = (skill / "assets/engine.html").read_text(encoding="utf-8")
sample = (skill / "examples/範例內容.md").read_text(encoding="utf-8")
assert src.count("__ENGINE__") == 1 and src.count("__SAMPLE__") == 1
out = src.replace("__ENGINE__", js(engine)).replace("__SAMPLE__", js(sample))
dst = skill / "assets/builder3d.html"; dst.write_text(out, encoding="utf-8"); print("輸出", dst, round(len(out.encode())/1024), "KB")
(skill / "index.html").write_text(out, encoding="utf-8")  # 根目錄的 index.html 與小幫手頁面相同，方便用 GitHub Pages 分享
