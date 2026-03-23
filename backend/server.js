import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Notion Client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_EXPENSE_DB_ID = process.env.NOTION_EXPENSE_DB_ID; // 支出資料庫
const NOTION_FINANCE_DB_ID = process.env.NOTION_FINANCE_DB_ID; // 財務資料庫

// ============ API Endpoints ============

// 1. 取得財務摘要
app.get('/api/finance/summary', async (req, res) => {
  try {
    // 從 Notion 取得支出資料（先抓全部）
    let totalExpenses = 0;
    if (NOTION_EXPENSE_DB_ID) {
      const expenseResponse = await notion.databases.query({
        database_id: NOTION_EXPENSE_DB_ID
      });
      
      totalExpenses = expenseResponse.results.reduce((sum, item) => {
        const amount = item.properties['支出金額']?.number || 0;
        return sum + amount;
      }, 0);
    }

    // 從環境變數或資料庫取得收入資料（目前先寫死範例資料）
    const income = {
      salary: parseFloat(process.env.SALARY || '50000'),
      dividend: parseFloat(process.env.DIVIDEND || '5000'),
      rent: parseFloat(process.env.RENT || '15000')
    };

    // 從環境變數取得負債
    const liabilities = {
      mortgage: parseFloat(process.env.MORTGAGE || '500000'),
      creditCard: parseFloat(process.env.CREDIT_CARD || '0')
    };

    // 從環境變數取得股票價值
    const stockValue = parseFloat(process.env.STOCK_VALUE || '0');
    const stockDetails = stockValue > 0 ? [
      { code: '2330.TW', name: '台積電', value: stockValue * 0.8 },
      { code: '其他', name: '其他股票', value: stockValue * 0.2 }
    ] : [];

    // 計算總額
    const totalIncome = income.salary + income.dividend + income.rent + stockValue;
    const totalLiabilities = liabilities.mortgage + liabilities.creditCard;
    const netWorth = totalIncome - totalLiabilities - totalExpenses;
    
    // 月變化（模擬：假設上個月 Net Worth 是 900000）
    const lastMonthNetWorth = 900000;
    const monthChange = netWorth - lastMonthNetWorth;
    const monthChangePercent = ((monthChange / lastMonthNetWorth) * 100).toFixed(1);

    res.json({
      netWorth,
      monthChange,
      monthChangePercent: parseFloat(monthChangePercent),
      income: { ...income, stockValue },
      expenses: totalExpenses,
      liabilities
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. 取得股票報價
app.get('/api/stock/prices', async (req, res) => {
  const stockValue = parseFloat(process.env.STOCK_VALUE || '0');
  
  if (stockValue > 0) {
    // 回傳手動輸入的股票價值
    res.json([
      { code: '2330.TW', name: '台積電', value: stockValue * 0.8, change: 0 },
      { code: '其他', name: '其他', value: stockValue * 0.2, change: 0 }
    ]);
  } else {
    res.json([]);
  }
});

// 3. 從 Notion 取得支出資料
app.get('/api/notion/expenses', async (req, res) => {
  try {
    if (!NOTION_EXPENSE_DB_ID) {
      return res.json({ error: 'Notion expense DB not configured', expenses: [] });
    }

    const response = await notion.databases.query({
      database_id: NOTION_EXPENSE_DB_ID,
      sorts: [
        { property: '日期', direction: 'descending' }
      ]
    });

    const expenses = response.results.map(item => ({
      id: item.id,
      description: item.properties['支出項目']?.title[0]?.plain_text || '無描述',
      amount: item.properties['支出金額']?.number || 0,
      category: item.properties['支出類別']?.select?.name || '未分類',
      date: item.properties['日期']?.date?.start || null
    }));

    res.json({ expenses });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. 取得趨勢數據（歷史記錄）
app.get('/api/finance/trend', async (req, res) => {
  // 模擬歷史數據（實際應從資料庫讀取）
  const trend = [
    { month: '2025-10', netWorth: 850000 },
    { month: '2025-11', netWorth: 870000 },
    { month: '2025-12', netWorth: 890000 },
    { month: '2026-01', netWorth: 880000 },
    { month: '2026-02', netWorth: 900000 },
    { month: '2026-03', netWorth: 920000 }
  ];
  
  res.json({ trend });
});

// 5. 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 6. 更新收入資料
app.post('/api/finance/income', (req, res) => {
  const { salary, dividend, rent, stockValue, mortgage, creditCard } = req.body;
  
  if (salary) process.env.SALARY = salary;
  if (dividend) process.env.DIVIDEND = dividend;
  if (rent) process.env.RENT = rent;
  if (stockValue) process.env.STOCK_VALUE = stockValue;
  if (mortgage) process.env.MORTGAGE = mortgage;
  if (creditCard) process.env.CREDIT_CARD = creditCard;
  
  res.json({ status: 'ok', message: '資料已更新' });
});

// ============ Start Server ============
app.listen(PORT, () => {
  console.log(`WealthPulse backend running on port ${PORT}`);
});
