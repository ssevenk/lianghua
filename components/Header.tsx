
import React, { useState } from 'react';
import { TrendingUp, Download, CheckCircle2, Clock } from 'lucide-react';
import { GlobalState, CalculatedStock, TagAllocation } from '../types';
import { MI_INITIAL, MA_INITIAL } from '../constants';

interface HeaderProps {
  globalState: GlobalState | null;
  stocks: CalculatedStock[];
  allocations: TagAllocation[];
  lastUpdated: Date;
}

export const Header: React.FC<HeaderProps> = ({ globalState, stocks, allocations, lastUpdated }) => {
  const [downloading, setDownloading] = useState(false);
  
  const handleExport = () => {
    if (!globalState) return;
    
    setDownloading(true);

    const year = lastUpdated.getFullYear();
    const month = (lastUpdated.getMonth() + 1).toString().padStart(2, '0');
    const day = lastUpdated.getDate().toString().padStart(2, '0');
    const hours = lastUpdated.getHours().toString().padStart(2, '0');
    const minutes = lastUpdated.getMinutes().toString().padStart(2, '0');
    
    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    const fileTimestamp = `${year}${month}${day}_${hours}${minutes}`;

    const miProfitAmount = globalState.miAsset - MI_INITIAL;
    const miProfitYield = (miProfitAmount / MI_INITIAL) * 100;
    const maProfitAmount = globalState.maAsset - MA_INITIAL;
    const maProfitYield = (maProfitAmount / MA_INITIAL) * 100;

    const exportData = {
      snapshotTime: formattedTime,
      exchangeRates: {
        usdToCny: Number((1 / (globalState.exchange.us || 1)).toFixed(4)),
        hkdToCny: Number((1 / (globalState.exchange.hk || 1)).toFixed(4))
      },
      summary: {
        totalNetAssetCNY: Math.floor(globalState.allClean),
        annualYield: globalState.yield + '%',
        miAssetCNY: Math.floor(globalState.miAsset),
        miProfitAmountCNY: Math.floor(miProfitAmount),
        miProfitYield: miProfitYield.toFixed(2) + '%',
        maAssetCNY: Math.floor(globalState.maAsset),
        maProfitAmountCNY: Math.floor(maProfitAmount),
        maProfitYield: maProfitYield.toFixed(2) + '%',
        leverageRatio: globalState.debtRatio + '%',
        totalAssetLeveragedCNY: Math.floor(globalState.allTotal),
        collateralValueCNY: Math.floor(globalState.allDanBao),
        availableDebtCNY: Math.floor(globalState.availableDebt),
        currentDebtCNY: Math.floor(globalState.debt)
      },
      stockValuations: stocks.map(s => ({
        name: s.name,
        modelScore: s.v,
        currentPrice: s.price.toFixed(2)
      })),
      allocationAnalysis: allocations.map(a => ({
        category: a.tag,
        targetRatio: a.targetRatio + '%',
        actualRatio: a.realRatio.toFixed(2) + '%',
        departureRatio: (a.departureRatio as number).toFixed(2) + '%',
        suggestedAdjustmentCNY: Math.floor(a.departureAmountCNY)
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileTimestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 py-2 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0 shadow-sm shadow-indigo-200">
            <TrendingUp className="text-white w-4 h-4 sm:w-5 h-5" />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <h1 className="text-sm sm:text-lg font-black text-slate-900 leading-tight truncate tracking-tight">高量化资产终端</h1>
              
              {/* 更加醒目的更新时间标签 */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 shadow-sm">
                <Clock className="w-3 h-3 sm:w-3.5 h-3.5 animate-pulse" />
                <span className="text-[11px] sm:text-sm font-black tracking-tight whitespace-nowrap tabular-nums">
                  {lastUpdated.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} {lastUpdated.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit', hour12: false})}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            disabled={!globalState || downloading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all active:scale-95 font-black text-[10px] sm:text-xs border shadow-sm ${
              downloading 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200 hover:border-indigo-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {downloading ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">已导出 JSON</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">导出数据快照</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
