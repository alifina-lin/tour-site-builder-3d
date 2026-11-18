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

## 科技大樓（v5，2026-11-18 併入）

- `tower-template.js`：科技大樓場景（`Hc.tower`），在引擎裡位於 `var dM = Hc[...]` 之前。
- `tower-theme.js`：科技大樓的日夜、鏡頭限制、陰影、介面主色；只在 `body.tpl-tower` 執行。
- `tower.css`：科技大樓專用樣式，全部限定在 `body.tpl-tower` 底下。
- 同時修正：側欄打開時（setViewOffset）滑鼠座標多加一次位移、桌機會點偏約 178px 的問題（六角群島也受益）。
- `maint/integrate_tower.py` 是當初把這些併入 v4.1 引擎的腳本，記錄了引擎裡每一處改動（版型 class、theme-decor 只在群島執行、環境音依版型切換等）。

## 市集（2026-11-18 併入）

- `market-template.js`：市集場景（`Hc.market`），接在科技大樓之後。
- `market.css`：市集專用樣式（限定 `body.tpl-market`）。
- `tower-theme.js` 現在是科技大樓與市集共用的日夜模組；鏡頭限制由各範本回傳的 `limits` 決定。

## 共用人群模組與關於本站（2026-11-18 晚）

- `crowd-kit.js`：`mkCrowd()`，大樓與市集共用的 low poly 人群（走路時腿以髖、手以肩為軸擺動；短髮／中長髮／長髮、褲裝／裙裝、包包）。
- 版型顯示名稱：小島、大樓、市集（舊名六角群島、科技大樓仍可用）。
- 導言最後的 info 圖示與「關於本站」視窗在 app 設定導言的地方（`HELPER_URL` 是小幫手網址）。
