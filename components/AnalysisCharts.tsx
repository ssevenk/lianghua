
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine, LabelList
} from 'recharts';
import { Activity, PieChart as PieChartIcon, ArrowRightLeft } from 'lucide-react';
import { TagAllocation } from '../types';
import { CardSkeleton } from './Skeletons';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TagAllocation;
    const isOver = data.departureAmountCNY > 0;

    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-100 text-sm min-w-[260px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-3 border-b pb-2">
          <div className={`w-2 h-2 rounded-full ${isOver ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
          <p className="font-black text-slate-900 text-base">{label}</p>
        </div>

        <div className="space-y-3">
          {/* 比例概览 */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目标比例</p>
              <p className="font-bold text-slate-700">{(data.targetRatio as number).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">实际比例</p>
              <p className="font-bold text-slate-900">{(data.realRatio as number).toFixed(2)}%</p>
            </div>
          </div>

          {/* 相对偏差百分比 */}
          <div className="flex justify-between items-center px-1">
            <span className="text-slate-500 font-medium">相对偏差率</span>
            <span className={`font-black text-base ${Math.abs(data.departureRatio as number) > 15
                ? 'text-rose-600'
                : Math.abs(data.departureRatio as number) > 10
                  ? 'text-amber-500'
                  : 'text-indigo-600'
              }`}>
              {(data.departureRatio as number > 0 ? '+' : '')}{(data.departureRatio as number).toFixed(2)}%
            </span>
          </div>

          {/* 偏差金额板块 - 决策核心 */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">需{isOver ? '减仓' : '补仓'}金额</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-[10px] font-bold text-slate-400">CNY</span>
                <span className={`text-sm font-black ${isOver ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ¥{Math.abs(Math.floor(data.departureAmountCNY)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-[10px] font-bold text-slate-400">USD</span>
                <span className={`text-xs font-bold ${isOver ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ${Math.abs(data.departureAmountUSD).toFixed(2).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-[10px] font-bold text-slate-400">HKD</span>
                <span className={`text-xs font-bold ${isOver ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ${Math.abs(data.departureAmountHKD).toFixed(2).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 text-sm min-w-[180px]">
        <p className="font-bold text-slate-900 mb-2 border-b pb-1">{data.tag}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">资产总额</span>
            <span className="font-bold text-slate-900 text-right">¥{Math.floor(data.currentTotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">实占比例</span>
            <span className="font-black text-indigo-600 text-right">{data.realRatio.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-black pointer-events-none">
      {name}
    </text>
  );
};

export const AnalysisCharts: React.FC<{ allocations: TagAllocation[], loading: boolean }> = ({ allocations, loading }) => (
  <div className="flex flex-col gap-6">
    {/* 配置相对偏差分析 */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg"><Activity className="text-indigo-600 w-5 h-5" /></div>
          <h2 className="text-lg font-bold text-slate-800">配置相对偏差分析</h2>
        </div>
        {!loading && (
          <div className="hidden sm:flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div> 正常</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-amber-400 rounded-sm"></div> 关注 (10%)</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div> 警报 (15%)</div>
          </div>
        )}
      </div>
      {loading ? <CardSkeleton height="400px" /> : (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allocations} margin={{ top: 25, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="tag" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
              <YAxis domain={[-15, 15]} allowDataOverflow={true} ticks={[-15, 0, 15]} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <ReferenceLine y={15} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={1} />
              <ReferenceLine y={10} stroke="#facc15" strokeDasharray="5 5" strokeWidth={1} />
              <ReferenceLine y={-10} stroke="#facc15" strokeDasharray="5 5" strokeWidth={1} />
              <ReferenceLine y={-15} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={1} />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Bar dataKey="departureRatio" name="相对偏差" radius={[4, 4, 0, 0]} barSize={36}>
                {allocations.map((entry, index) => {
                  const dev = Math.abs(entry.departureRatio as number);
                  let fill = '#6366f1';
                  if (dev > 15) fill = '#f43f5e';
                  else if (dev > 10) fill = '#facc15';
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
                <LabelList dataKey="departureRatio" position="top" formatter={(val: number) => `${(val > 0 ? '+' : '')}${val.toFixed(1)}%`} style={{ fontSize: '10px', fontWeight: '800', fill: '#475569' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>

    {/* 当前实仓分布 */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-50 rounded-lg"><PieChartIcon className="text-violet-600 w-5 h-5" /></div>
          <h2 className="text-lg font-bold text-slate-800">当前实仓分布</h2>
        </div>
      </div>
      {loading ? <CardSkeleton height="320px" /> : (
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
          <div className="h-[320px] w-full sm:w-[50%]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocations.filter(a => (a.currentTotal as number) > 0)} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={4} dataKey="currentTotal" nameKey="tag" stroke="none" labelLine={false} label={renderCustomizedPieLabel}>
                  {allocations.filter(a => (a.currentTotal as number) > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-[50%] grid grid-cols-2 gap-x-8 gap-y-3 px-4">
            {allocations.filter(a => (a.currentTotal as number) > 0).map((a, i) => (
              <div key={a.tag} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-bold text-slate-700 truncate">{a.tag}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">{(a.realRatio as number).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);
