
import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';
import { fetchDashboardData } from './services/financeService';
import { GlobalState, CalculatedStock, TagAllocation } from './types';

// 导入拆分后的子组件
import { Header } from './components/Header';
import { AssetOverview } from './components/AssetOverview';
import { AnalysisCharts } from './components/AnalysisCharts';
import { ValuationTable } from './components/ValuationTable';
import { ExchangeRateSection } from './components/ExchangeRateSection';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalState, setGlobalState] = useState<GlobalState | null>(null);
  const [stocks, setStocks] = useState<CalculatedStock[]>([]);
  const [allocations, setAllocations] = useState<TagAllocation[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const initData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardData();
      
      setGlobalState(data.globalState);
      setStocks(data.stocks);
      setAllocations(data.allocations);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '初始化数据时发生未知错误';
      console.error('Failed to initialize dashboard data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  // 全局错误状态渲染
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-rose-100 p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">服务连接中断</h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
            {error}
            <br />
            请检查网络连接或稍后再试。
          </p>
          <button 
            onClick={initData}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-200 text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 h-5" />
            重新尝试连接
          </button>
        </div>
      </div>
    );
  }

  if (loading && !globalState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 text-sm sm:text-base font-medium">正在拉取腾讯实时行情并重新建模计算...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 sm:pb-12 bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-8 mt-4 sm:mt-8">
        <div className="space-y-4 sm:space-y-6">
          {globalState && <AssetOverview globalState={globalState} lastUpdated={lastUpdated} />}
          
          <AnalysisCharts allocations={allocations} loading={loading} />

          <ValuationTable stocks={stocks} loading={loading} />

          {globalState && <ExchangeRateSection globalState={globalState} />}
        </div>
      </main>
    </div>
  );
};

export default App;
