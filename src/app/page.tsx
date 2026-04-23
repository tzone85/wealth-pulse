'use client';

import MetricCard from '@/components/MetricCard';
import GrowthChart from '@/components/GrowthChart';
import MarketChart from '@/components/MarketChart';
import { getMarketIndices, getCurrencyPairs, getCommodities, getZARHistory, getJSEHistory } from '@/lib/market-data';
import { formatNumber } from '@/lib/utils';
import { TrendingUp, DollarSign, Gem, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const indices = getMarketIndices();
  const currencies = getCurrencyPairs();
  const commodities = getCommodities();
  const zarHistory = getZARHistory();
  const jseHistory = getJSEHistory();

  const zarUsd = currencies.find(c => c.pair === 'ZAR/USD');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Your financial command centre. Updated April 2026.</p>
      </div>

      {/* Portfolio Overview */}
      <div className="bg-gradient-to-br from-emerald-950/50 to-zinc-900 border border-emerald-800/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Starting Portfolio</h2>
            <p className="text-sm text-zinc-400">Phase 0: Stop the Bleeding</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-zinc-500">Starting Capital</p>
            <p className="text-2xl font-bold text-emerald-400">R100</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Target (8 months)</p>
            <p className="text-2xl font-bold text-amber-400">R1,000</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Monthly Contribution</p>
            <p className="text-2xl font-bold text-blue-400">R100</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Platform</p>
            <p className="text-lg font-bold text-white">EasyEquities TFSA</p>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="ZAR / USD"
          value={`R${zarUsd?.rate.toFixed(2)}`}
          change={zarUsd?.change}
          changePercent={zarUsd?.changePercent}
          icon={<DollarSign className="w-6 h-6" />}
          subtitle="Weaker ZAR boosts resource stocks"
        />
        <MetricCard
          title="Gold"
          value={`$${formatNumber(commodities[0].price, 0)}/oz`}
          change={commodities[0].change}
          changePercent={commodities[0].changePercent}
          icon={<Gem className="w-6 h-6" />}
          subtitle="SA is a major producer"
        />
        <MetricCard
          title="JSE Top 40"
          value={formatNumber(indices[1].value, 0)}
          change={indices[1].change}
          changePercent={indices[1].changePercent}
          icon={<BarChart3 className="w-6 h-6" />}
          subtitle="Broad SA market"
        />
        <MetricCard
          title="Platinum"
          value={`$${formatNumber(commodities[1].price, 0)}/oz`}
          change={commodities[1].change}
          changePercent={commodities[1].changePercent}
          icon={<Gem className="w-6 h-6" />}
          subtitle="SA produces 70% of world supply"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketChart data={zarHistory} title="ZAR/USD (12 months)" color="#60a5fa" prefix="R" />
        <MarketChart data={jseHistory} title="JSE Top 40 (12 months)" color="#34d399" />
      </div>

      {/* Growth Simulator */}
      <GrowthChart />

      {/* Geopolitical Context */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Global Context Affecting SA Markets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-zinc-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Russia-Ukraine Conflict</h4>
            <p className="text-xs text-zinc-400">Continues to support elevated commodity prices. Gold remains strong above $2,350/oz. SA as a major commodity producer benefits from higher resource prices, boosting JSE mining stocks.</p>
          </div>
          <div className="border border-zinc-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">US-China Trade Tensions</h4>
            <p className="text-xs text-zinc-400">Tariff escalation creates volatility in emerging market currencies. ZAR has traded in the R18-19.50/USD range. Weaker rand boosts rand-denominated returns for commodity exporters.</p>
          </div>
          <div className="border border-zinc-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-emerald-400 mb-2">SA Mining Advantage</h4>
            <p className="text-xs text-zinc-400">South Africa produces ~70% of world platinum and is a top gold producer. When commodities rise, SA mining stocks outperform. Consider Satrix RESI for targeted exposure.</p>
          </div>
          <div className="border border-zinc-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">SARB Interest Rates</h4>
            <p className="text-xs text-zinc-400">SA Reserve Bank has been cautious with rate cuts. Higher rates increase debt servicing costs. Focus on paying down high-interest debt before aggressive investing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
