
import React from 'react';
import { RefreshCw } from 'lucide-react';

export const CardSkeleton = ({ height = "400px" }: { height?: string }) => (
  <div className="w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-xl animate-pulse" style={{ height }}>
    <RefreshCw className="w-8 h-8 text-indigo-300 animate-spin mb-3" />
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">计算模型中...</span>
  </div>
);

export const TableSkeleton = () => (
  <div className="w-full p-6 space-y-4 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-12 bg-slate-50 rounded-lg w-full border border-slate-100"></div>
    ))}
  </div>
);
