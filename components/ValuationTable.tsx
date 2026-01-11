
import React, { useMemo } from 'react';
import { CalculatedStock } from '../types';
import { TableSkeleton } from './Skeletons';
import { ValuationRow } from './ValuationRow';

const HEADER_CONFIG = [
  { label: '股票', className: 'sticky left-0 bg-slate-50 z-40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-24' },
  { label: '模型分', className: 'text-center w-16' },
  { label: '当前价', className: 'w-20' },
  { label: '对标沪深', className: 'w-16' },
  { label: '对标最高', className: 'w-16' },
  { label: 'PE(实)', className: 'w-16' },
  { label: 'PE(合)', className: 'w-16' },
  { label: '+5%', className: 'text-rose-600 w-20' },
  { label: '得分', className: 'text-rose-600 w-16' },
  { label: '对标沪深', className: 'w-16' },
  { label: '对标最高', className: 'w-16' },
  { label: '-5%', className: 'text-emerald-600 w-20' },
  { label: '得分', className: 'text-emerald-600 w-16' },
  { label: '对标沪深', className: 'w-16' },
  { label: '对标最高', className: 'w-16' },
];

export const ValuationTable: React.FC<{ stocks: CalculatedStock[], loading: boolean }> = ({ stocks, loading }) => {
  // 性能优化：记忆化昂贵的数组搜索与计算
  const stats = useMemo(() => {
    if (stocks.length === 0) return { maxV: -Infinity, benchmarkV: 0 };
    
    const max = Math.max(...stocks.map(s => Number(s.v)));
    const benchmark = stocks.find(s => s.name === '沪深');
    
    return {
      maxV: max,
      benchmarkV: benchmark ? Number(benchmark.v) : 0
    };
  }, [stocks]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {loading && stocks.length === 0 ? <TableSkeleton /> : (
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0 min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] sm:text-[11px] font-black uppercase tracking-widest sticky top-0 z-30">
              <tr>
                {HEADER_CONFIG.map((col, idx) => (
                  <th key={idx} className={`px-2 sm:px-3 py-2.5 border-b border-slate-200 ${col.className}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stocks.map((s) => (
                <ValuationRow 
                  key={s.name} 
                  stock={s} 
                  maxV={stats.maxV} 
                  benchmarkV={stats.benchmarkV} 
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
