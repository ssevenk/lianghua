
import React from 'react';
import { Banknote, Globe } from 'lucide-react';
import { GlobalState } from '../types';

export const ExchangeRateSection: React.FC<{ globalState: GlobalState }> = ({ globalState }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    {/* 模块内部标题栏 */}
    <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
      <Globe className="w-3.5 h-3.5 text-indigo-600" />
      <h2 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">实时汇率</h2>
    </div>

    <div className="p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 rounded-md"><Banknote className="w-4 h-4 text-emerald-600" /></div>
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">USD / CNY</div>
              <div className="text-base font-black text-slate-900 tabular-nums">{(1 / (globalState.exchange.us || 1)).toFixed(4)}</div>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[8px] font-bold text-slate-400 uppercase">1 美元兑换</div>
            <div className="text-[9px] font-bold text-indigo-600">人民币</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 rounded-md"><Banknote className="w-4 h-4 text-blue-600" /></div>
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">HKD / CNY</div>
              <div className="text-base font-black text-slate-900 tabular-nums">{(1 / (globalState.exchange.hk || 1)).toFixed(4)}</div>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[8px] font-bold text-slate-400 uppercase">1 港币兑换</div>
            <div className="text-[9px] font-bold text-indigo-600">人民币</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
