'use client';

import GrowthChart from '@/components/GrowthChart';

export default function Calculator() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Growth Calculator</h1>
        <p className="text-zinc-400 mt-1">Visualize how your money grows with consistent investing</p>
      </div>

      <GrowthChart />

      {/* ETF Recommendations */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recommended ETFs for Small Investors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white">Satrix Top 40</h4>
              <span className="text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">STX40</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">Tracks the 40 largest JSE-listed companies. Broad SA market exposure with very low fees.</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">TER</span>
                <span className="text-white">0.10%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">5-Year Return</span>
                <span className="text-emerald-400">~48% (8.2% p.a.)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Min Investment</span>
                <span className="text-white">R1 (EasyEquities)</span>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white">Satrix MSCI World</h4>
              <span className="text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded">STXWDM</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">Global diversification in rands. Tracks 1,500+ companies across 23 developed markets.</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">TER</span>
                <span className="text-white">0.35%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">5-Year Return</span>
                <span className="text-emerald-400">~85% (13.1% p.a.)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Min Investment</span>
                <span className="text-white">R1 (EasyEquities)</span>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white">1nvest Gold ETF</h4>
              <span className="text-xs text-amber-400 bg-amber-950 px-2 py-0.5 rounded">GLD</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">Direct gold price exposure in rands. Good hedge against ZAR weakness and inflation.</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">TER</span>
                <span className="text-white">0.30%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">5-Year Return</span>
                <span className="text-emerald-400">~110% (16.0% p.a.)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Min Investment</span>
                <span className="text-white">R1 (EasyEquities)</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mt-4">
          Recommended split: 50% STX40 + 50% STXWDM inside a TFSA. Add GLD if you want commodity hedging. All available on EasyEquities with no minimums.
        </p>
      </div>

      {/* The Math */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">The Math: How Compound Interest Works</h3>
        <div className="bg-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300">
          <p>FV = P × (1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]</p>
          <div className="mt-3 text-xs text-zinc-500 space-y-1">
            <p>FV = Future Value (what you end up with)</p>
            <p>P = Principal (starting amount, e.g. R100)</p>
            <p>r = Annual interest rate (e.g. 0.10 for 10%)</p>
            <p>n = Compounding frequency (12 for monthly)</p>
            <p>t = Time in years</p>
            <p>PMT = Monthly payment (e.g. R100)</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-3">
          No magic numbers. The calculator above uses this exact formula. The key insight: time in the market beats timing the market. Start with whatever you can afford — even R100/month — and let compounding do the work.
        </p>
      </div>
    </div>
  );
}
