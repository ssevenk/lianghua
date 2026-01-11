
import React, { memo } from 'react';
import { Trophy } from 'lucide-react';
import { CalculatedStock } from '../types';
import { formatPrice, getDiffPrefix } from '../utils/formatters';

interface ValuationRowProps {
  stock: CalculatedStock;
  maxV: number;
  benchmarkV: number;
}

const ValuationRowComponent: React.FC<ValuationRowProps> = ({ stock, maxV, benchmarkV }) => {
  const isBenchmark = stock.name === '沪深';
  const currentV = Number(stock.v);
  const isWinner = currentV === maxV && maxV !== -Infinity;
  
  const diffBenchmark = (currentV - benchmarkV).toFixed(2);
  const diffMax = (currentV - maxV).toFixed(2);

  const v2Val = Number(stock.v2);
  const v3Val = Number(stock.v3);
  const v2DiffBenchmark = (v2Val - benchmarkV).toFixed(2);
  const v2DiffMax = (v2Val - maxV).toFixed(2);
  const v3DiffBenchmark = (v3Val - benchmarkV).toFixed(2);
  const v3DiffMax = (v3Val - maxV).toFixed(2);

  let rowBgClass = 'bg-white hover:bg-slate-50/80';
  let stickyBgClass = 'bg-white group-hover:bg-slate-50';
  let nameClass = 'text-slate-800';
  
  if (isWinner) {
    rowBgClass = 'bg-emerald-50/50 hover:bg-emerald-100/50';
    stickyBgClass = 'bg-[#f0fdf4] group-hover:bg-[#dcfce7]';
    nameClass = 'text-emerald-900';
  } else if (isBenchmark) {
    rowBgClass = 'bg-amber-50/50 hover:bg-amber-100/50';
    stickyBgClass = 'bg-[#fffbeb] group-hover:bg-[#fef3c7]';
    nameClass = 'text-amber-900';
  }

  const RenderVGroup = ({ price, v, diffB, diffM, colorClass }: { price: number, v: string, diffB: string, diffM: string, colorClass: string }) => (
    <>
      <td className={`px-2 sm:px-3 py-1.5 font-bold tabular-nums whitespace-nowrap ${colorClass}`}>¥{price.toFixed(1)}</td>
      <td className={`px-2 sm:px-3 py-1.5 font-black ${colorClass}`}>{v}</td>
      <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">{getDiffPrefix(diffB)}{diffB}</td>
      <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">{diffM}</td>
    </>
  );

  return (
    <tr className={`transition-colors group ${rowBgClass}`}>
      <td className={`px-2 sm:px-3 py-1.5 font-bold ${nameClass} sticky left-0 ${stickyBgClass} z-20 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)]`}>
        <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="truncate">{stock.name}</span>
          {isWinner && <Trophy className="w-3 h-3 text-emerald-600 shrink-0" />}
          {isBenchmark && (
            <span className="text-[7px] px-0.5 py-px bg-amber-200 text-amber-900 rounded font-black tracking-tighter shrink-0">
              BASE
            </span>
          )}
        </div>
      </td>
      <td className="px-2 sm:px-3 py-1.5 font-black tabular-nums text-center text-slate-900">{stock.v}</td>
      <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums whitespace-nowrap text-slate-900">{formatPrice(stock.price)}</td>
      <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">{getDiffPrefix(diffBenchmark)}{diffBenchmark}</td>
      <td className="px-2 sm:px-3 py-1.5 font-bold tabular-nums text-slate-500">{isWinner ? 'MAX' : diffMax}</td>
      <td className="px-2 sm:px-3 py-1.5 text-slate-500 tabular-nums">{stock.zhenshiPe.toFixed(1)}</td>
      <td className="px-2 sm:px-3 py-1.5 text-slate-500 tabular-nums">{stock.normalPe.toFixed(1)}</td>
      
      <RenderVGroup price={stock.p2} v={stock.v2} diffB={v2DiffBenchmark} diffM={v2DiffMax} colorClass="text-rose-700" />
      <RenderVGroup price={stock.p3} v={stock.v3} diffB={v3DiffBenchmark} diffM={v3DiffMax} colorClass="text-emerald-700" />
    </tr>
  );
};

// 导出记忆化后的组件
export const ValuationRow = memo(ValuationRowComponent);
