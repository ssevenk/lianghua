
import React from 'react';
import { Activity, Trophy, ChevronRight } from 'lucide-react';
import { CalculatedStock } from '../types';
import { TableSkeleton } from './Skeletons';

export const ValuationTable: React.FC<{ stocks: CalculatedStock[], loading: boolean }> = ({ stocks, loading }) => {
  // 计算最高分
  const maxV = stocks.length > 0 ? Math.max(...stocks.map(s => Number(s.v))) : -Infinity;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-800">个股模型估值</h2>
        </div>
        <div className="flex sm:hidden items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          右滑查看更多 <ChevronRight className="w-3 h-3" />
        </div>
      </div>
      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0 min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest sticky top-0 z-30">
              <tr>
                {/* 表头首列：必须是固体背景色 z-40 */}
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 sticky left-0 bg-slate-100 z-40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">股票</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">模型分</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">当前价</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">PE(实)</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">PE(合)</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 text-rose-600">+5%</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 text-rose-600">得分</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 text-emerald-600">-5%</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 text-emerald-600">得分</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stocks.map((s) => {
                const isBenchmark = s.name === '沪深';
                const isWinner = Number(s.v) === maxV && maxV !== -Infinity;

                // 定义固体背景色，防止滚动重叠
                let rowBgClass = 'bg-white hover:bg-slate-50';
                let stickyBgClass = 'bg-white group-hover:bg-slate-50';
                let nameClass = 'text-slate-800';

                if (isWinner) {
                  rowBgClass = 'bg-emerald-50 hover:bg-emerald-100';
                  stickyBgClass = 'bg-emerald-50 group-hover:bg-emerald-100';
                  nameClass = 'text-emerald-900';
                } else if (isBenchmark) {
                  rowBgClass = 'bg-amber-50 hover:bg-amber-100';
                  stickyBgClass = 'bg-amber-50 group-hover:bg-amber-100';
                  nameClass = 'text-amber-900';
                }

                return (
                  <tr key={s.name} className={`transition-colors group ${rowBgClass}`}>
                    {/* 表身首列：必须设置明确的 bg- 且 z-20，并增加右侧阴影遮挡滚动内容 */}
                    <td className={`px-4 sm:px-6 py-3 sm:py-4 font-bold ${nameClass} sticky left-0 ${stickyBgClass} z-20 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors`}>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {s.name}
                        {isWinner && <Trophy className="w-3 h-3 text-emerald-600 shrink-0" />}
                        {isBenchmark && (
                          <span className="text-[8px] px-1 py-0.5 bg-amber-200 text-amber-900 rounded font-black tracking-tighter shrink-0">
                            BASE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-black tabular-nums">{s.v}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold tabular-nums">¥{s.price.toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 tabular-nums">{s.zhenshiPe.toFixed(1)}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 tabular-nums">{s.normalPe.toFixed(1)}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-rose-700 font-bold tabular-nums">¥{s.p2.toFixed(1)}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-rose-800 font-black">{s.v2}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-emerald-700 font-bold tabular-nums">¥{s.p3.toFixed(1)}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-emerald-800 font-black">{s.v3}</td>
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
