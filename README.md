# 💰 WealthPulse - 財務儀表板

個人財務追蹤應用，整合收入、支出、股票與負債。

## 功能

- 📊 Net Worth 總覽 + 月變化百分比
- 💵 收入明細（薪水、股票配息、房租）
- 📈 股票市值即時報價（Yahoo Finance）
- 🏦 負債狀態（房貸、信用卡）
- 📉 月度趨勢圖
- 🔄 自動從 Notion 同步支出資料

## 快速開始

### 1. 後端 Setup

```bash
cd backend
cp .env.example .env
# 編輯 .env 填入你的設定
npm install
npm start
```

### 2. 前端

直接開啟 `index.html` 或部署到任何靜態網頁伺服器。

### 3. 環境變數

在 `.env` 中設定：

```
# Notion
NOTION_API_KEY=你的_notion_api_key
NOTION_EXPENSE_DB_ID=你的支出資料庫ID

# 收入
SALARY=50000
DIVIDEND=5000
RENT=15000

# 負債
MORTGAGE=500000
CREDIT_CARD=0

# 股票 (JSON)
STOCKS=[{"code":"2330.TW","shares":500},{"code":"AAPL","shares":50}]
```

## 技術

- 後端：Node.js + Express + Yahoo Finance API + Notion SDK
- 前端：Vanilla JS + Tailwind CDN
- 資料來源：Notion、Yahoo Finance、手動輸入
