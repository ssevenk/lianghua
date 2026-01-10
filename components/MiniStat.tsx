
import React from 'react';

interface MiniStatProps { 
  title: string; 
  value?: number; 
  icon: React.ReactNode; 
  highlight?: boolean; 
  color?: 'default' | 'pink' | 'amber' | 'rose'; 
  isRatio?: boolean;
  subInfo?: string;
  large?: boolean;
}

export const MiniStat: React.FC<MiniStatProps> = ({ title, value, icon, highlight, color = 'default', isRatio = false, subInfo, large = false }) => {
  const colorStyles = { 
    default: 'text-slate-400', 
    pink: 'text-pink-400', 
    amber: 'text-amber-400',
    rose: 'text-rose-400' 
  };
  return (
    <div className={`flex items-center gap-2.5 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border transition-all flex-1 ${highlight ? 'bg-indigo-50/30 border-indigo-100 shadow-sm ring-1 ring-indigo-50 transform hover:scale-[1.02]' : 'bg-white border-slate-200/50 hover:bg-slate-50'}`}>
      <div className={`${large ? 'p-2 sm:p-2.5' : 'p-1 sm:p-1.5'} rounded-lg sm:rounded-xl shrink-0 ${highlight ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
        {/* Fix: Cast icon to React.ReactElement<any> to allow merging className property into its props */}
        {React.cloneElement(icon as React.ReactElement<any>, { className: `${large ? 'w-5 h-5 sm:w-6 h-6' : 'w-3.5 h-3.5 sm:w-4 h-4'}` })}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`${large ? 'text-[11px] sm:text-base font-black' : 'text-[8px] sm:text-[9px] font-black'} uppercase tracking-[0.1em] sm:tracking-[0.15em] mb-0.5 sm:mb-1.5 ${colorStyles[color]} truncate`}>{title}</div>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-3 gap-y-0.5">
          <div className={`${large ? 'text-lg sm:text-3xl' : 'text-sm sm:text-base'} font-black tabular-nums tracking-tight whitespace-nowrap ${highlight ? 'text-indigo-900' : 'text-slate-800'}`}>
            {!isRatio && <span className={`${large ? 'text-[10px] sm:text-sm' : 'text-[9px] sm:text-[10px]'} font-bold mr-0.5 opacity-40`}>¥</span>}
            {value !== undefined && !isNaN(value) ? Math.floor(value).toLocaleString() : '---'}
          </div>
          {subInfo && (
            <div className={`${large ? 'text-[10px] sm:text-sm' : 'text-[8px] sm:text-[10px]'} font-bold tabular-nums truncate opacity-90 ${color === 'pink' ? 'text-pink-600' : color === 'amber' ? 'text-amber-600' : 'text-slate-500'}`}>
              {subInfo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
