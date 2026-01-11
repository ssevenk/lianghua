
import React, { memo } from 'react';

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

const MiniStatComponent: React.FC<MiniStatProps> = ({ title, value, icon, highlight, color = 'default', isRatio = false, subInfo, large = false }) => {
  const colorStyles = { 
    default: 'text-slate-400', 
    pink: 'text-pink-400', 
    amber: 'text-amber-400',
    rose: 'text-rose-400' 
  };
  return (
    <div className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border transition-all flex-1 ${highlight ? 'bg-indigo-50/30 border-indigo-100 shadow-sm ring-1 ring-indigo-50' : 'bg-white border-slate-200/50 hover:bg-slate-50'}`}>
      <div className={`${large ? 'p-1.5 sm:p-2' : 'p-1 sm:p-1.5'} rounded-md sm:rounded-lg shrink-0 ${highlight ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: `${large ? 'w-4 h-4 sm:w-5 h-5' : 'w-3 h-3 sm:w-3.5 h-3.5'}` })}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`${large ? 'text-[9px] sm:text-xs font-black' : 'text-[8px] sm:text-[9px] font-black'} uppercase tracking-widest mb-0.5 ${colorStyles[color]} truncate`}>{title}</div>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <div className={`${large ? 'text-base sm:text-xl' : 'text-sm sm:text-base'} font-black tabular-nums tracking-tight whitespace-nowrap ${highlight ? 'text-indigo-900' : 'text-slate-800'}`}>
            {!isRatio && <span className={`${large ? 'text-[9px] sm:text-xs' : 'text-[8px] sm:text-[9px]'} font-bold mr-0.5 opacity-40`}>¥</span>}
            {value !== undefined && !isNaN(value) ? Math.floor(value).toLocaleString() : '---'}
          </div>
          {subInfo && (
            <div className={`${large ? 'text-[9px] sm:text-xs' : 'text-[7px] sm:text-[8px]'} font-bold tabular-nums truncate opacity-90 ${color === 'pink' ? 'text-pink-600' : color === 'amber' ? 'text-amber-600' : 'text-slate-500'}`}>
              {subInfo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MiniStat = memo(MiniStatComponent);
