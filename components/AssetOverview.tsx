
import React from 'react';
import { Wallet, Clock, Users, Activity, ShieldCheck, Zap, CreditCard, Percent } from 'lucide-react';
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
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* 资产概况头部 */}
      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <div className="p-1.5 bg-indigo-50 rounded-lg">
            <Wallet className="text-indigo-600 w-4 h-4 sm:w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">资产概况</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-x-10">
          <div className="flex items-center gap-2.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm self-start">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] sm:text-sm font-bold tracking-tight">
              {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>

          <div className="flex flex-row sm:flex-row items-center gap-8 sm:gap-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">总净资产</span>
              <div className="text-xl sm:text-3xl font-black tracking-tight tabular-nums text-slate-900 leading-none">
                <span className="text-sm sm:text-base mr-0.5 text-slate-300 font-bold">¥</span>
                {Math.floor(globalState.allClean).toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">今年收益率</span>
              <div className={`text-xl sm:text-3xl font-black tracking-tight tabular-nums leading-none ${isPositiveYield ? 'text-red-600' : 'text-emerald-600'}`}>
                {isPositiveYield ? '+' : ''}{globalState.yield}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 合伙人份额 */}
      <div className="px-4 sm:px-8 py-6 sm:py-8 bg-slate-50/50 border-y border-slate-100">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">合伙人份额</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <MiniStat 
            title="咪咪资产" 
            value={globalState.miAsset} 
            icon={<Users className="w-5 h-5" />} 
            color="pink" 
            subInfo={`+${Math.floor(miGrowthVal).toLocaleString()} (${miGrowthPct.toFixed(2)}%)`}
            large
          />
          <MiniStat 
            title="妈妈资产" 
            value={globalState.maAsset} 
            icon={<Users className="w-5 h-5" />} 
            color="amber" 
            subInfo={`+${Math.floor(maGrowthVal).toLocaleString()} (${maGrowthPct.toFixed(2)}%)`}
            large
          />
        </div>
      </div>
      
      {/* 风险控制 */}
      <div className="p-4 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">杠杆与风控状态</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          <MiniStat title="虚总资产" value={globalState.allTotal} icon={<Activity className="w-4 h-4" />} />
          <MiniStat title="担保 (抵押值)" value={globalState.allDanBao} icon={<ShieldCheck className="w-4 h-4" />} />
          <MiniStat title="虚金 (可用债务)" value={globalState.availableDebt} icon={<Zap className="w-4 h-4" />} />
          <MiniStat title="现债" value={globalState.debt} icon={<CreditCard className="w-4 h-4" />} />
          <MiniStat title="比例" value={globalState.debtRatio} icon={<Percent className="w-4 h-4" />} isRatio />
        </div>
      </div>
    </div>
  );
};
