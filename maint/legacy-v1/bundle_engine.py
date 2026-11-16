#!/usr/bin/env python3
"""維護者工具：把 engine.src.html 內的 three.js 一起打包進去，輸出離線可開的 assets/engine.html。
需要：npm install three@0.160.0 esbuild（在 maint 資料夾或 THREE_ROOT 指定的位置）"""
import re, subprocess, sys, os, pathlib
here = pathlib.Path(__file__).resolve().parent
root = pathlib.Path(os.environ.get("THREE_ROOT", here.parent.parent / "work"))
src = (here / "engine.src.html").read_text(encoding="utf-8")
m = re.search(r'<script type="module">(.*?)</script>', src, re.S)
entry = root / "_engine_entry.js"; entry.write_text(m.group(1), encoding="utf-8")
out = subprocess.run([str(root / "node_modules/.bin/esbuild"), str(entry), "--bundle", "--minify", "--format=esm", "--charset=utf8", "--target=es2020"], capture_output=True, text=True, check=True).stdout
out = out.replace("</script", "<\\/script")
html = src[:m.start()] + '<script type="module">' + out + "</script>" + src[m.end():]
dst = pathlib.Path(sys.argv[1]); dst.write_text(html, encoding="utf-8"); entry.unlink()
print("輸出", dst, round(len(html.encode())/1024), "KB")
