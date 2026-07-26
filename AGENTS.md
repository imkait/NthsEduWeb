# AGENTS.md

## 專案定位

NthsEduWeb 是一個給高中學生使用的靜態 AI 輔助教學入口網站，整合數學、物理、化學、生物與資訊科的互動式教材。

## 技術棧

- 前端：HTML5、CSS3、Vanilla JavaScript
- 介面資源：Google Fonts、SVG、Canvas
- 架構：純靜態網站，沒有建置流程，修改後可直接用瀏覽器開啟 `index.html` 驗證

## 專案結構

- `index.html`：入口首頁
- `style.css`：首頁樣式
- `Light/`：光學互動教學
- `Elements/`：元素週期表互動教學
- `Meiosis/`：減數分裂互動教學
- `Trigono/`：三角函數互動教學
- `Datapacket/`：封包傳遞與 TCP/IP 互動教學
- `vector/`：向量相關教材
- `114201.html`：專案內既有的獨立頁面
- `.agent/`：任務計畫、交接與模板資料夾

## 工作規則

- 新增或修改頁面時，優先維持現有的靜態 HTML/CSS/JS 寫法，不引入不必要的框架。
- 子頁回首頁連結統一使用 `../index.html`。
- 版面變動要保留 RWD 行為，必要時先確認小螢幕與桌機都能正常閱讀。
- 不要硬編碼 Windows 專用路徑字元；跨平台路徑一律保持中性寫法。
- 變更後以最小範圍驗證，靜態頁面優先直接開啟檔案檢查。

## 交接與紀錄

- 重大變更先寫進 `docs/decisions.md`。
- 每次工作收尾要更新 `handoff.md` 與 `CHANGELOG.md`。
- 單一任務的細節與執行紀錄放在 `.agent/` 底下。