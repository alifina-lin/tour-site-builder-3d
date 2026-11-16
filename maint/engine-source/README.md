# v4 可讀原始碼（從 v4 引擎拆出，僅供閱讀與修改參考）

這些檔案是從 `assets/engine.html`（Ali 的 v4 效能優化版）直接切出來的，**不是**當初的原始專案：

- `app.js`：主程式（場景、人物、道路、步驟流程、`window.__tour`）。有排版，但部分區域變數名被縮短；three.js 以命名空間變數引用。
- `theme-decor.js`、`sound.js`、`theme.css`、`base.css`、`body.html`：完整可讀。
- three.js（r160）已打包在引擎裡，這裡省略。

注意：
- 修改後仍需回到 `assets/engine.html` 的對應區塊貼回，並保留 `__SITE_DATA__` 佔位符（整份只能出現一次）。
- 修改後請跑 `python3 maint/test_builder.py .. out` 與 `scripts/kit.py shoot` 驗證。
- 音效預設為關閉（`sound.js` 的 `let on = false`），日夜依時間自動切換，可手動切換。
- v4.1 修改處：建築造型與高低錯落（hMul、Zt）、全景分類標籤（crowdCat）、聚焦鏡頭（islandPose）；原版 v4 保存在 `maint/engine.v4.original.html`。
