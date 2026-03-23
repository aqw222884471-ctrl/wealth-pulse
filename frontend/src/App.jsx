import { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, stocksRes] = await Promise.all([
        fetch('/api/finance/summary'),
        fetch('/api/stock/prices')
      ]);
      
      const summaryData = await summaryRes.json();
      const stocksData = await stocksRes.json();
      
      setData(summaryData);
      setStocks(stocksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '—';
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatPercent = (num) => {
    if (num === null || num === undefined) return '—';
    const prefix = num >= 0 ? '+' : '';
    return `${prefix}${num}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">載入中...</div>
      </div>
    );
  }

  const changePercent = data?.monthChangePercent || 0;
  const isPositive = changePercent >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-emerald-400">💰 WealthPulse</h1>
        <p className="text-gray-400">財富脈動 · 財務儀表板</p>
      </div>

      {/* Net Worth Card */}
      <div className="card animate-fade-in">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">淨資產 Net Worth</p>
          <h2 className="text-5xl font-bold mb-4">{formatNumber(data?.netWorth)}</h2>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <span className="text-2xl">{isPositive ? '📈' : '📉'}</span>
            <span className="text-xl font-semibold">{formatPercent(changePercent)}</span>
            <span className="text-gray-400">({formatNumber(data?.monthChange)})</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <p className="text-gray-400 text-sm mb-1">本月收入</p>
          <p className="text-2xl font-semibold text-emerald-400">
            {formatNumber((data?.income?.salary || 0) + (data?.income?.dividend || 0) + (data?.income?.rent || 0) + (data?.income?.stockValue || 0))}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            薪水 {formatNumber(data?.income?.salary)} + 股票 {formatNumber(data?.income?.stockValue)}
          </p>
        </div>

        <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-gray-400 text-sm mb-1">本月支出</p>
          <p className="text-2xl font-semibold text-red-400">
            {formatNumber(data?.expenses)}
          </p>
          <p className="text-xs text-gray-500 mt-2">來自 Notion</p>
        </div>

        <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-400 text-sm mb-1">本月結餘</p>
          <p className={`text-2xl font-semibold ${
            (data?.income?.salary + data?.income?.dividend + data?.income?.rent + data?.income?.stockValue - data?.expenses) >= 0 
              ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {formatNumber(
              (data?.income?.salary || 0) + 
              (data?.income?.dividend || 0) + 
              (data?.income?.rent || 0) + 
              (data?.income?.stockValue || 0) - 
              (data?.expenses || 0)
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">收入 - 支出</p>
        </div>
      </div>

      {/* Stocks Section */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-xl font-semibold mb-4">📈 股票資產</h3>
        <div className="space-y-3">
          {stocks.map((stock, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="font-semibold">{stock.code}</p>
                <p className="text-sm text-gray-400">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatNumber(stock.value)}</p>
                <p className={`text-sm ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stock.change?.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liabilities Section */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-xl font-semibold mb-4">🏦 負債</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span>房貸餘額</span>
            <span className="font-semibold text-red-400">{formatNumber(data?.liabilities?.mortgage)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span>信用卡負債</span>
            <span className="font-semibold text-red-400">{formatNumber(data?.liabilities?.creditCard)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4">
        <p>資料更新時間：{new Date().toLocaleString('zh-TW')}</p>
        <button 
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          重新整理 🔄
        </button>
      </div>
    </div>
  );
}

export default App;
