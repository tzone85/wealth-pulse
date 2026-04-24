'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { HistoricalPoint } from '@/types/market';

interface MarketChartProps {
  data: HistoricalPoint[];
  title: string;
  color: string;
  prefix?: string;
  suffix?: string;
}

export default function MarketChart({ data, title, color, prefix = '', suffix = '' }: MarketChartProps) {
  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const change = last - first;
  const changePercent = first > 0 ? ((change / first) * 100) : 0;
  const isPositive = change >= 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium text-zinc-400">{title}</h4>
          <p className="text-xl font-bold text-white">{prefix}{last.toLocaleString('en-US')}{suffix}</p>
        </div>
        <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
          isPositive ? 'text-emerald-400 bg-emerald-950' : 'text-red-400 bg-red-950'
        }`}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} />
          <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value) => [`${prefix}${Number(value).toLocaleString('en-US')}${suffix}`, title]}
          />
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad-${title.replace(/\s/g, '')})`} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
