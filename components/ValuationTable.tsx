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
          <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0 min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] sm:text-[11px] font-black uppercase tracking-widest sticky top-0 z-30">
              <tr>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 sticky left-0 bg-slate-50 z-40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-24">股票</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16 text-center">模型分</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-20">当前价</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">对标沪深</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">对标最高</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">PE(实)</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">PE(合)</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 text-rose-600 w-20">+5%</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 text-rose-600 w-16">得分</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">对标沪深</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">对标最高</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 text-emerald-600 w-20">-5%</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 text-emerald-600 w-16">得分</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">对标沪深</th>
                <th className="px-2 sm:px-3 py-2.5 border-b border-slate-200 w-16">对标最高</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stocks.map((s) => {
                const isBenchmark = s.name === '沪深';
                const currentV = Number(s.v);
                const isWinner = currentV === maxV && maxV !== -Infinity;
                
                const diffBenchmark = (currentV - benchmarkV).toFixed(2);
                const diffMax = (currentV - maxV).toFixed(2);

                const v2Val = Number(s.v2);
                const v3Val = Number(s.v3);

                const v2DiffBenchmark = (v2Val - benchmarkV).toFixed(2);
                const v2DiffMax = (v2Val - maxV).toFixed(2);
                const v3DiffBenchmark = (v3Val - benchmarkV).toFixed(2);
                const v3DiffMax = (v3Val - maxV).toFixed(2);

                // 核心修复逻辑：吸顶单元格 (sticky column) 必须是不透明的
                let rowBgClass = 'bg-white hover:bg-slate-50/80';
                let stickyBgClass = 'bg-white group-hover:bg-slate-50'; // 移除透明度
                let nameClass = 'text-slate-800';
                
                if (isWinner) {
                  rowBgClass = 'bg-emerald-50/50 hover:bg-emerald-100/50';
                  stickyBgClass = 'bg-[#f0fdf4] group-hover:bg-[#dcfce7]'; // 对应 emerald-50 和 emerald-100 的实色
                  nameClass = 'text-emerald-900';
                } else if (isBenchmark) {
                  rowBgClass = 'bg-amber-50/50 hover:bg-amber-100/50';
                  stickyBgClass = 'bg-[#fffbeb] group-hover:bg-[#fef3c7]'; // 对应 amber-50 和 amber-100 的实色
                  nameClass = 'text-amber-900';
                }

                return (
                  <tr key={s.name} className={`transition-colors group ${rowBgClass}`}>
                    <td className={`px-2 sm:px-3 py-1.5 font-bold ${nameClass} sticky left-0 ${stickyBgClass} z-20 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)]`}>
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
                    <td className="px-2 sm:px-3 py-1.5 font-black tabular-nums text-center text-slate-900">{s.v}</td>
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums whitespace-nowrap text-slate-900">¥{s.price.toFixed(2)}</td>
                    
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">
                      {Number(diffBenchmark) > 0 ? '+' : ''}{diffBenchmark}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">
                      {currentV === maxV ? 'MAX' : diffMax}
                    </td>

                    <td className="px-2 sm:px-3 py-1.5 text-slate-500 tabular-nums">{s.zhenshiPe.toFixed(1)}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-slate-500 tabular-nums">{s.normalPe.toFixed(1)}</td>
                    
                    {/* +5% 分组 */}
                    <td className="px-2 sm:px-3 py-1.5 text-rose-700 font-bold tabular-nums whitespace-nowrap">¥{s.p2.toFixed(1)}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-rose-800 font-black">{s.v2}</td>
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">
                      {Number(v2DiffBenchmark) > 0 ? '+' : ''}{v2DiffBenchmark}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">
                      {v2DiffMax}
                    </td>

                    {/* -5% 分组 */}
                    <td className="px-2 sm:px-3 py-1.5 text-emerald-700 font-bold tabular-nums whitespace-nowrap">¥{s.p3.toFixed(1)}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-emerald-800 font-black">{s.v3}</td>
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">
                      {Number(v3DiffBenchmark) > 0 ? '+' : ''}{v3DiffBenchmark}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">
                      {v3DiffMax}
                    </td>
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
