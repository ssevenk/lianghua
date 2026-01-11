import React from 'react';
import { Trophy } from 'lucide-react';
import { CalculatedStock } from '../types';
import { TableSkeleton } from './Skeletons';

export const ValuationTable: React.FC<{ stocks: CalculatedStock[], loading: boolean }> = ({ stocks, loading }) => {
  const maxV = stocks.length > 0 ? Math.max(...stocks.map(s => Number(s.v))) : -Infinity;
  const benchmarkStock = stocks.find(s => s.name === '沪深');
  const benchmarkV = benchmarkStock ? Number(benchmarkStock.v) : 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0 min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] sm:text-[11px] font-black uppercase tracking-widest sticky top-0 z-30">
              <tr>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 sticky left-0 bg-slate-100 z-40 shadow-[1px_0_3px_rgba(0,0,0,0.05)] w-24">股票</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16 text-center">模型分</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-20">当前价</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">对标沪深</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">对标最高</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">PE(实)</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">PE(合)</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 text-rose-600 w-20">+5%</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 text-rose-600 w-16">得分</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 text-emerald-600 w-20">-5%</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 text-emerald-600 w-16">得分</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stocks.map((s) => {
                const isBenchmark = s.name === '沪深';
                const currentV = Number(s.v);
                const isWinner = currentV === maxV && maxV !== -Infinity;
                
                const diffBenchmark = (currentV - benchmarkV).toFixed(2);
                const diffMax = (currentV - maxV).toFixed(2);

                let rowBgClass = 'bg-white hover:bg-slate-50/80';
                let stickyBgClass = 'bg-white group-hover:bg-slate-50/80'; 
                let nameClass = 'text-slate-800';
                
                if (isWinner) {
                  rowBgClass = 'bg-emerald-50/50 hover:bg-emerald-50';
                  stickyBgClass = 'bg-emerald-50/50 group-hover:bg-emerald-50';
                  nameClass = 'text-emerald-900';
                } else if (isBenchmark) {
                  rowBgClass = 'bg-amber-50/50 hover:bg-amber-50';
                  stickyBgClass = 'bg-amber-50/50 group-hover:bg-amber-50';
                  nameClass = 'text-amber-900';
                }

                return (
                  <tr key={s.name} className={`transition-colors group ${rowBgClass}`}>
                    <td className={`px-2 sm:px-3 py-1.5 font-bold ${nameClass} sticky left-0 ${stickyBgClass} z-20 border-r border-slate-100 shadow-[1px_0_3px_rgba(0,0,0,0.05)]`}>
                      <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        <span className="truncate">{s.name}</span>
                        {isWinner && <Trophy className="w-3 h-3 text-emerald-600 shrink-0" />}
                        {isBenchmark && (
                          <span className="text-[7px] px-0.5 py-px bg-amber-200 text-amber-900 rounded font-black tracking-tighter shrink-0">
                            BASE
                          </span>
                        )}
                      </div>
                    </td>
                    {/* 模型分 - 保持深色 */}
                    <td className="px-2 sm:px-3 py-1.5 font-black tabular-nums text-center text-slate-900">{s.v}</td>
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums whitespace-nowrap text-slate-900">¥{s.price.toFixed(2)}</td>
                    
                    {/* 对标沪深 - 改为深灰色 */}
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">
                      {Number(diffBenchmark) > 0 ? '+' : ''}{diffBenchmark}
                    </td>
                    
                    {/* 对标最高 - 改为深灰色 */}
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">
                      {currentV === maxV ? 'MAX' : diffMax}
                    </td>

                    <td className="px-2 sm:px-3 py-1.5 text-slate-500 tabular-nums">{s.zhenshiPe.toFixed(1)}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-slate-500 tabular-nums">{s.normalPe.toFixed(1)}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-rose-700 font-bold tabular-nums whitespace-nowrap">¥{s.p2.toFixed(1)}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-rose-800 font-black">{s.v2}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-emerald-700 font-bold tabular-nums whitespace-nowrap">¥{s.p3.toFixed(1)}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-emerald-800 font-black">{s.v3}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
