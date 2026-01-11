import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ReferenceLine, LabelList
} from 'recharts';
import { ArrowRightLeft } from 'lucide-react';
import { TagAllocation, PieItem } from '../types';
import { CardSkeleton } from './Skeletons';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#14b8a6', 
  '#a855f7', '#f59e0b', '#10b981', '#64748b'
];

// 自定义 X 轴文字渲染逻辑
const CustomXAxisTick = (props: any) => {
  const { x, y, payload, index, data } = props;
  const entry = data[index];
  if (!entry) return null;

  const dev = Math.abs(entry.departureRatio as number);
  let fill = '#64748b'; // 默认颜色
  // 红色警报：偏离目标比例超过 15%
  if (dev > 15) fill = '#f43f5e'; 
  // 黄色警报：偏离目标比例超过 10%
  else if (dev > 10) fill = '#facc15'; 

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={fill}
        className="text-[12px] sm:text-[14px] font-black tracking-tight"
      >
        {payload.value}
      </text>
    </g>
  );
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.04) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central" 
      className="text-[9px] font-black pointer-events-none drop-shadow-sm"
    >
      {name}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TagAllocation;
    const isOver = data.departureAmountCNY > 0;
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100 text-[11px] min-w-[200px]">
        <div className="flex items-center gap-1.5 mb-2 border-b pb-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isOver ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
          <p className="font-black text-slate-900 text-sm">{label}</p>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1.5 rounded-md">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">目标</p>
              <p className="font-bold text-slate-700">{(data.targetRatio as number).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">实际</p>
              <p className="font-bold text-slate-900">{(data.realRatio as number).toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex justify-between items-center px-0.5">
            <span className="text-slate-500 font-medium">相对偏差率</span>
            <span className={`font-black text-xs ${
              Math.abs(data.departureRatio as number) > 15 
                ? 'text-rose-600' 
                : Math.abs(data.departureRatio as number) > 10 
                  ? 'text-amber-500' 
                  : 'text-indigo-600'
            }`}>
              {(data.departureRatio as number > 0 ? '+' : '')}{(data.departureRatio as number).toFixed(1)}%
            </span>
          </div>

          <div className="border-t border-slate-100 pt-2">
            <div className="flex items-center gap-1 mb-1">
              <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">需{isOver ? '减仓' : '补仓'}</span>
            </div>
            
            <div className="space-y-0.5">
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-[8px] font-bold text-slate-400">CNY</span>
                <span className={`text-xs font-black ${isOver ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ¥{Math.abs(Math.floor(data.departureAmountCNY)).toLocaleString()}
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
    const data = payload[0].payload as PieItem;
    return (
      <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-100 text-[11px] min-w-[140px]">
        <p className="font-bold text-slate-900 mb-1 border-b pb-0.5">{data.name}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">金额</span>
            <span className="font-bold text-slate-900">¥{Math.floor(data.value).toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">占比</span>
            <span className="font-black text-indigo-600">{data.ratio.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalysisCharts: React.FC<{ allocations: TagAllocation[], pieData: PieItem[], loading: boolean }> = ({ allocations, pieData, loading }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
      {loading ? <CardSkeleton height="280px" /> : (
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
                <XAxis 
                  dataKey="tag" 
                  height={45} 
                  interval={0} 
                  tick={<CustomXAxisTick data={allocations} />}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis domain={[-20, 20]} allowDataOverflow={true} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <ReferenceLine y={0} stroke="#e2e8f0" />
                <Bar dataKey="departureRatio" radius={[4, 4, 0, 0]} barSize={28}>
                  {/* 常驻显示偏差比例数值 */}
                  <LabelList 
                    dataKey="departureRatio" 
                    position="top" 
                    offset={10}
                    formatter={(val: number) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
                    className="text-[10px] sm:text-[11px] font-black fill-slate-500"
                  />
                  {allocations.map((entry, index) => {
                    const dev = Math.abs(entry.departureRatio as number);
                    let fill = '#6366f1';
                    if (dev > 15) fill = '#f43f5e';
                    else if (dev > 10) fill = '#facc15';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>

    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
      {loading ? <CardSkeleton height="280px" /> : (
        <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
          <div className="h-[240px] w-full sm:w-[45%]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55} 
                  outerRadius={95} 
                  paddingAngle={2} 
                  dataKey="value" 
                  nameKey="name" 
                  stroke="none"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
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
                <div className="text-[10px] font-black text-slate-900 tabular-nums shrink-0">
                  {item.ratio.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);