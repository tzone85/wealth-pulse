'use client';

import MetricCard from '@/components/MetricCard';
import MarketChart from '@/components/MarketChart';
import { getMarketIndices, getCurrencyPairs, getCommodities, getZARHistory, getJSEHistory } from '@/lib/market-data';
import { formatNumber } from '@/lib/utils';

export default function Markets() {
  const indices = getMarketIndices();
  const currencies = getCurrencyPairs();
  const commodities = getCommodities();
  const zarHistory = getZARHistory();
  const jseHistory = getJSEHistory();

  // Generate gold and platinum history from base data
  const goldHistory = zarHistory.map((p, i) => ({
    date: p.date,
    value: 2200 + Math.round(i * 14 + Math.sin(i * 0.8) * 40),
  }));
  const platinumHistory = zarHistory.map((p, i) => ({
    date: p.date,
    value: 980 + Math.round(i * 6 + Math.cos(i * 0.6) * 25),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Market Pulse</h1>
        <p className="text-zinc-400 mt-1">SA and global markets at a glance</p>
      </div>

      {/* SA Markets */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">South African Markets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indices.filter(i => i.currency === 'ZAR').map(index => (
            <MetricCard
              key={index.symbol}
              title={index.name}
              value={formatNumber(index.value, 0)}
              change={index.change}
              changePercent={index.changePercent}
            />
          ))}
        </div>
      </div>

      {/* Global Markets */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Global Markets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indices.filter(i => i.currency !== 'ZAR').map(index => (
            <MetricCard
              key={index.symbol}
              title={index.name}
              value={formatNumber(index.value, 0)}
              change={index.change}
              changePercent={index.changePercent}
              subtitle={index.currency}
            />
          ))}
        </div>
      </div>

      {/* Currencies */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">ZAR Strength</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currencies.map(pair => (
            <MetricCard
              key={pair.pair}
              title={pair.pair}
              value={`R${pair.rate.toFixed(2)}`}
              change={pair.change}
              changePercent={pair.changePercent}
            />
          ))}
        </div>
      </div>

      {/* Commodities */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Commodities (SA Relevant)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commodities.map(commodity => (
            <MetricCard
              key={commodity.symbol}
              title={commodity.name}
              value={`$${formatNumber(commodity.price, 0)}`}
              change={commodity.change}
              changePercent={commodity.changePercent}
              subtitle={commodity.unit}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketChart data={zarHistory} title="ZAR/USD (12 months)" color="#60a5fa" prefix="R" />
        <MarketChart data={jseHistory} title="JSE Top 40 (12 months)" color="#34d399" />
        <MarketChart data={goldHistory} title="Gold (12 months)" color="#fbbf24" prefix="$" suffix="/oz" />
        <MarketChart data={platinumHistory} title="Platinum (12 months)" color="#a78bfa" prefix="$" suffix="/oz" />
      </div>
    </div>
  );
}
