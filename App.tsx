
import React from 'react';
import { AlertCircle, RotateCcw, RefreshCw } from 'lucide-react';
import { useDashboard } from './hooks/useDashboard';

import { Header } from './components/Header';
import { AssetOverview } from './components/AssetOverview';
import { ValuationTable } from './components/ValuationTable';
import { AnalysisCharts } from './components/AnalysisCharts';
import { ExchangeRateSection } from './components/ExchangeRateSection';

const App: React.FC = () => {
  const { 
    loading, error, globalState, stocks, allocations, pieData, lastUpdated, refresh 
  } = useDashboard();

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-rose-100 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-black text-slate-900 mb-1">服务连接中断</h2>
          <p className="text-slate-500 text-xs mb-4">{error}</p>
          <button onClick={refresh} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm">
            <RotateCcw className="w-4 h-4" /> 重新尝试连接
          </button>
        </div>
      </div>
    );
  }

  // 仅在首次完全没有数据时显示加载页
  if (loading && !globalState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-600 text-xs font-medium uppercase tracking-widest">建模计算中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 bg-slate-50">
      <Header 
        globalState={globalState} 
        stocks={stocks} 
        allocations={allocations} 
        lastUpdated={lastUpdated} 
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 mt-3 sm:mt-4">
        <div className="space-y-4">
          {globalState && <AssetOverview globalState={globalState} lastUpdated={lastUpdated} />}
          <ValuationTable stocks={stocks} loading={loading} />
          <AnalysisCharts allocations={allocations} pieData={pieData} loading={loading} />
          {globalState && <ExchangeRateSection globalState={globalState} />}
        </div>
      </main>
    </div>
  );
};

export default App;
