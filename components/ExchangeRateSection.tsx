
import React from 'react';
import { Banknote } from 'lucide-react';
import { GlobalState } from '../types';

export const ExchangeRateSection: React.FC<{ globalState: GlobalState }> = ({ globalState }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5">
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
);
