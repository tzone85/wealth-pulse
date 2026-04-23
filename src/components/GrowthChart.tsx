'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { calculateCompoundGrowth } from '@/lib/market-data';
import { formatCurrency } from '@/lib/utils';

export default function GrowthChart() {
  const [initial, setInitial] = useState(100);
  const [monthly, setMonthly] = useState(100);
  const [months, setMonths] = useState(60);

  const data = useMemo(
    () => calculateCompoundGrowth(initial, monthly, months),
    [initial, monthly, months]
  );

  const finalData = data[data.length - 1];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-1">Compound Growth Simulator</h3>
      <p className="text-sm text-zinc-400 mb-6">See how your money grows with consistent investing</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Starting Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">R</span>
            <input
              type="number"
              value={initial}
              onChange={(e) => setInitial(Math.max(0, Number(e.target.value)))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Monthly Contribution</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">R</span>
            <input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(Math.max(0, Number(e.target.value)))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Time Horizon: {Math.floor(months / 12)}y {months % 12}m</label>
          <input
            type="range"
            min="6"
            max="120"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-950/50 border border-blue-800/30 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-400">Conservative (7%)</p>
          <p className="text-lg font-bold text-blue-300">{formatCurrency(finalData.conservative)}</p>
        </div>
        <div className="bg-emerald-950/50 border border-emerald-800/30 rounded-lg p-3 text-center">
          <p className="text-xs text-emerald-400">Moderate (10%)</p>
          <p className="text-lg font-bold text-emerald-300">{formatCurrency(finalData.moderate)}</p>
        </div>
        <div className="bg-amber-950/50 border border-amber-800/30 rounded-lg p-3 text-center">
          <p className="text-xs text-amber-400">Aggressive (15%)</p>
          <p className="text-lg font-bold text-amber-300">{formatCurrency(finalData.aggressive)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#71717a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradConservative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradModerate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAggressive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickFormatter={(m) => `${Math.floor(m / 12)}y`}
            interval={Math.floor(months / 6)}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
            labelFormatter={(m) => `Month ${m}`}
            formatter={(value) => [formatCurrency(Number(value)), '']}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
          <Area type="monotone" dataKey="invested" name="Invested" stroke="#71717a" fill="url(#gradInvested)" strokeWidth={1.5} dot={false} />
          <Area type="monotone" dataKey="conservative" name="Conservative (7%)" stroke="#60a5fa" fill="url(#gradConservative)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="moderate" name="Moderate (10%)" stroke="#34d399" fill="url(#gradModerate)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="aggressive" name="Aggressive (15%)" stroke="#fbbf24" fill="url(#gradAggressive)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-xs text-zinc-500 mt-3">
        Total invested: {formatCurrency(finalData.invested)} |
        Growth at 10%: {formatCurrency(finalData.moderate - finalData.invested)} gain ({((finalData.moderate / finalData.invested - 1) * 100).toFixed(1)}%)
      </p>
    </div>
  );
}
