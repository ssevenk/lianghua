
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ReferenceLine, LabelList
} from 'recharts';
import { ArrowRightLeft, Target, PieChart as PieChartIcon } from 'lucide-react';
import { TagAllocation, PieItem } from '../types';
import { CardSkeleton } from './Skeletons';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#14b8a6', 
  '#a855f7', '#f59e0b', '#10b981', '#64748b'
];

const RED_THRESHOLD = 15;
const YELLOW_THRESHOLD = 13;

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, index, data } = props;
  // 防御性检查：确保 data 存在且索引有效
  const entry = data && data[index] ? data[index] : null;
  if (!entry) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#94a3b8" className="text-[10px]">{payload?.value || ''}</text>
      </g>
    );
  }
  
  const dev = Math.abs(entry.departureRatio as number || 0);
  let fill = '#64748b';
  if (dev > RED_THRESHOLD) fill = '#f43f5e'; 
  else if (dev > YELLOW_THRESHOLD) fill = '#facc15'; 

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill={fill} className="text-[12px] sm:text-[14px] font-black tracking-tight">{payload.value}</text>
    </g>
  );
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (!percent || percent < 0.04) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[9px] font-black pointer-events-none drop-shadow-sm">{name}</text>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TagAllocation;
    const isOver = (data.departureAmountCNY || 0) > 0;
    const absCNY = Math.abs(data.departureAmountCNY || 0);
    const absUSD = Math.abs(data.departureAmountUSD as number || 0);
    const absHKD = Math.abs(data.departureAmountHKD as number || 0);
    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100 text-[11px] min-w-[220px]">
        <div className="flex items-center gap-1.5 mb-2 border-b pb-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
          <p className="font-black text-slate-900 text-sm">{label}</p>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1.5 rounded-md">
            <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">目标</p><p className="font-bold text-slate-700">{(data.targetRatio as number || 0).toFixed(2)}%</p></div>
            <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">实际</p><p className="font-bold text-slate-900">{(data.realRatio as number || 0).toFixed(2)}%</p></div>
          </div>
          <div className="flex justify-between items-center px-0.5">
            <span className="text-slate-500 font-medium">相对偏差率</span>
            <span className={`font-black text-xs ${Math.abs(data.departureRatio as number || 0) > RED_THRESHOLD ? 'text-rose-600' : Math.abs(data.departureRatio as number || 0) > YELLOW_THRESHOLD ? 'text-amber-500' : 'text-indigo-600'}`}>
              {(data.departureRatio as number || 0 > 0 ? '+' : '')}{(data.departureRatio as number || 0).toFixed(2)}%
            </span>
          </div>
          <div className="border-t border-slate-100 pt-2">
            <div className="flex items-center gap-1 mb-1"><ArrowRightLeft className="w-2.5 h-2.5 text-slate-400" /><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">需{isOver ? '减仓' : '补仓'}金额</span></div>
            <div className="space-y-1">
              <div className="flex justify-between items-baseline font-mono bg-slate-50/50 px-1.5 py-0.5 rounded"><span className="text-[8px] font-bold text-slate-400">CNY</span><span className={`text-xs font-black ${isOver ? 'text-amber-600' : 'text-emerald-600'}`}>¥{absCNY.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between items-baseline font-mono px-1.5 py-0.5"><span className="text-[8px] font-bold text-slate-400">USD</span><span className={`text-[10px] font-black ${isOver ? 'text-amber-600/80' : 'text-emerald-600/80'}`}>${absUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between items-baseline font-mono px-1.5 py-0.5"><span className="text-[8px] font-bold text-slate-400">HKD</span><span className={`text-[10px] font-black ${isOver ? 'text-amber-600/80' : 'text-emerald-600/80'}`}>${absHKD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
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
    const data = payload[0].payload as PieItem;
    return (
      <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-100 text-[11px] min-w-[140px]">
        <p className="font-bold text-slate-900 mb-1 border-b pb-0.5">{data.name}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-3"><span className="text-slate-500">金额</span><span className="font-bold text-slate-900">¥{(data.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">占比</span><span className="font-black text-indigo-600">{(data.ratio || 0).toFixed(2)}%</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalysisCharts: React.FC<{ allocations: TagAllocation[], pieData: PieItem[], loading: boolean }> = ({ allocations, pieData, loading }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
        <Target className="w-3.5 h-3.5 text-indigo-600" />
        <h2 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">当前偏差</h2>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {loading || !allocations || allocations.length === 0 ? <CardSkeleton height="280px" /> : (
          <>
            <div className="flex justify-end mb-2">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-sm"></div> 正常</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-sm"></div> 警报</div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocations} margin={{ top: 20, right: 5, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="tag" height={45} interval={0} tick={<CustomXAxisTick data={allocations} />} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis domain={[-20, 20]} allowDataOverflow={true} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <ReferenceLine y={0} stroke="#e2e8f0" />
                  <Bar dataKey="departureRatio" radius={[4, 4, 0, 0]} barSize={28}>
                    <LabelList dataKey="departureRatio" position="top" offset={10} formatter={(val: number) => `${val > 0 ? '+' : ''}${(val || 0).toFixed(2)}%`} className="text-[10px] sm:text-[11px] font-black fill-slate-500" />
                    {allocations.map((entry, index) => {
                      const dev = Math.abs(entry.departureRatio as number || 0);
                      let fill = '#6366f1';
                      if (dev > RED_THRESHOLD) fill = '#f43f5e';
                      else if (dev > YELLOW_THRESHOLD) fill = '#facc15';
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
        <PieChartIcon className="w-3.5 h-3.5 text-indigo-600" />
        <h2 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">持仓分布</h2>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {loading || !pieData || pieData.length === 0 ? <CardSkeleton height="280px" /> : (
          <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
            <div className="h-[240px] w-full sm:w-[45%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} dataKey="value" nameKey="name" stroke="none" label={renderCustomizedLabel} labelLine={false}>
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-[55%] grid grid-cols-2 gap-x-4 gap-y-1 px-2 overflow-y-auto max-h-[240px] scrollbar-hide">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-700 truncate">{item.name}</span>
                  </div>
                  <div className="text-[10px] font-black text-slate-900 tabular-nums shrink-0">{(item.ratio || 0).toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
