
import React from 'react';
import { TrendingUp } from 'lucide-react';

export const Header: React.FC = () => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-8">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg shrink-0">
          <TrendingUp className="text-white w-5 h-5 sm:w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-tight truncate">高量化资产终端</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate">建模驱动的决策中心</p>
        </div>
      </div>
    </div>
  </nav>
);
