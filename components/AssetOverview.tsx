
import React from 'react';
import { Users, Activity, ShieldCheck, Zap, CreditCard, Percent } from 'lucide-react';
import { GlobalState } from '../types';
import { MiniStat } from './MiniStat';
import { MI_INITIAL, MA_INITIAL } from '../constants';

export const AssetOverview: React.FC<{ globalState: GlobalState, lastUpdated: Date }> = ({ globalState, lastUpdated }) => {
  const isPositiveYield = Number(globalState.yield) >= 0;
  const miGrowthVal = globalState.miAsset - MI_INITIAL;
  const miGrowthPct = (miGrowthVal / MI_INITIAL) * 100;
  const maGrowthVal = globalState.maAsset - MA_INITIAL;
  const maGrowthPct = (maGrowthVal / MA_INITIAL) * 100;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* 核心大指标 - 独立成行 */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap items-end gap-x-12 gap-y-4 border-b border-slate-100">
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-slate-400 block">总净资产 (CNY)</span>
          <div className="text-xl sm:text-2xl font-black tracking-tight tabular-nums text-slate-900 leading-none flex items-baseline">
            <span className="text-xs sm:text-base mr-1 text-slate-300 font-bold">¥</span>
            {Math.floor(globalState.allClean).toLocaleString()}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-slate-400 block">本年累计收益率</span>
          <div className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums leading-none ${isPositiveYield ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isPositiveYield ? '+' : ''}{globalState.yield}%
          </div>
        </div>
      </div>

      {/* 合伙人份额 */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-50/50 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <div className="flex flex-1 w-full gap-2 sm:gap-3">
            <MiniStat 
              title="咪咪账户" 
              value={globalState.miAsset} 
              icon={<Users className="w-5 h-5" />} 
              color="pink" 
              subInfo={`+${Math.floor(miGrowthVal).toLocaleString()} (${miGrowthPct.toFixed(1)}%)`}
              large
            />
            <MiniStat 
              title="妈妈账户" 
              value={globalState.maAsset} 
              icon={<Users className="w-5 h-5" />} 
              color="amber" 
              subInfo={`+${Math.floor(maGrowthVal).toLocaleString()} (${maGrowthPct.toFixed(1)}%)`}
              large
            />
          </div>
        </div>
      </div>
      
      {/* 风险控制指标 */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">杠杆及风控状态</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          <MiniStat title="名义总值" value={globalState.allTotal} icon={<Activity className="w-4 h-4" />} />
          <MiniStat title="担保价值" value={globalState.allDanBao} icon={<ShieldCheck className="w-4 h-4" />} />
          <MiniStat title="可用额度" value={globalState.availableDebt} icon={<Zap className="w-4 h-4" />} />
          <MiniStat title="当前负债" value={globalState.debt} icon={<CreditCard className="w-4 h-4" />} />
          <MiniStat title="保证金率" value={globalState.debtRatio} icon={<Percent className="w-4 h-4" />} isRatio />
        </div>
      </div>
    </div>
  );
};
