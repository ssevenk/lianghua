
import React from 'react';
import { Globe, Banknote } from 'lucide-react';
import { GlobalState } from '../types';

export const ExchangeRateSection: React.FC<{ globalState: GlobalState }> = ({ globalState }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
    <div className="flex items-center gap-2 mb-6">
      <Globe className="w-5 h-5 text-indigo-600" />
      <h2 className="text-lg font-bold text-slate-800">实时汇率参考 (Against CNY)</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg"><Banknote className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">USD / CNY</div>
            <div className="text-xl font-black text-slate-900 tabular-nums">{(1 / (globalState.exchange.us || 1)).toFixed(4)}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400">1 美元兑换</div>
          <div className="text-xs font-bold text-indigo-600">人民币</div>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><Banknote className="w-5 h-5 text-blue-600" /></div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">HKD / CNY</div>
            <div className="text-xl font-black text-slate-900 tabular-nums">{(1 / (globalState.exchange.hk || 1)).toFixed(4)}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400">1 港币兑换</div>
          <div className="text-xs font-bold text-indigo-600">人民币</div>
        </div>
      </div>
    </div>
  </div>
);
