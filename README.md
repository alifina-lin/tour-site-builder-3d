# NCCU 3D 導覽網站小幫手（skill）

給一份資料，AI 幫你整理成六張表，核對後先看預覽，再輸出一個可以逛的 3D 微縮世界導覽網站（單一 HTML，可離線開啟）。

## 怎麼用

**能執行程式的 AI（流程 A，建議）**：把整個資料夾放進 skill 目錄（Claude 的 skills 資料夾，或在 Claude 的設定裡上傳這個資料夾的 zip），然後對 AI 說「幫我把這份資料做成 3D 導覽網站」並附上資料。AI 會依序：整理 xlsx → 你核對 → 給 1～3 張預覽圖 → 你定案 → 輸出整站 zip。

**只能貼文字的 AI（流程 B，備案）**：把 `SKILL.md` 整份貼給 AI，再貼上資料。AI 會輸出六張表；你複製後，雙擊打開 `assets/builder3d.html`，貼到左邊就能預覽，滿意就按「下載我的導覽網站」。

原始碼：https://github.com/alifina-lin/tour-site-builder-3d　發佈後的小幫手網址：https://alifina-lin.github.io/tour-site-builder-3d/（產生的導覽網站「關於本站」會連到這裡，網址寫在引擎的 `HELPER_URL`）

想先看效果：打開 `index.html`（與 `assets/builder3d.html` 相同；放到 GitHub Pages 就有網址可分享），按「載入範例看看」。頁面左上的「請 AI 把原始資料整理成六張表」會說明做法，並附可複製的指令。

## 資料夾

```
SKILL.md              給 AI 讀的完整流程（A 主流程、B 備案）
scripts/kit.py        檢查 xlsx、建置網站、截圖、轉 Markdown 表
assets/engine.html    3D 引擎（已內嵌 three.js，不需網路）
assets/builder3d.html 小幫手頁面：貼六張表→預覽→下載（流程 B 用）
references/           設計規格、欄位說明、語氣、新增場景範本
examples/             範例（虛構資料）
maint/                維護者工具：重組小幫手頁面、測試；legacy-v1/ 是舊版引擎原始碼
```

## 現況與限制

- 場景範本有三種：「小島」（每個分類一座六角形島，島間有道路，路上有人、貓、鴿子）、「大樓」（玻璃帷幕大樓，每個分類一層樓、每個項目一間房，點樓層會穿過玻璃進到樓層平面）與「市集」（紅磚廣場上的帳篷市集，每個分類一區、每個項目一個攤位，有人潮，導覽時沿走道走到攤位前）。在 xlsx 的 `範本` 欄填寫，或在小幫手頁面右上切換。新增場景的方法見 `references/新增場景範本.md`。
- 網站會依電腦時間自動切換白天／夜晚，並有合成音效（預設關閉，可手動開啟）；場景用 instancing 優化，手機較順（見 `references/設計規格.md`）。
- 需要 WebGL 的瀏覽器（近幾年的 Chrome、Edge、Safari、Firefox 都可以）。
- 圖片需自行放進 `images/` 資料夾；沒放的圖會自動隱藏。
