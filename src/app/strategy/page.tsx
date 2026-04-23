'use client';

import PhaseTracker from '@/components/PhaseTracker';

export default function Strategy() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Strategy Guide</h1>
        <p className="text-zinc-400 mt-1">Your phased roadmap from R100 to financial freedom</p>
      </div>

      <PhaseTracker />

      {/* Hard Rules */}
      <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4">Hard Rules (All Phases)</h3>
        <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside">
          <li>Never invest money needed for debt payments or family essentials</li>
          <li>Never use leverage until Phase 3 minimum</li>
          <li>Track every rand — in and out</li>
          <li>If a strategy isn&apos;t understood, don&apos;t use it</li>
          <li>Daily review: what did we earn, what did we learn, what&apos;s next</li>
          <li>As portfolio grows, risk percentage per trade DECREASES, not increases</li>
          <li>The Airbnb is revenue infrastructure — never neglect it for trading dopamine</li>
        </ol>
      </div>

      {/* Platform Comparison */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Platform Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Platform</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Min Trade</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Fees</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">TFSA</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-2 font-medium text-emerald-400">EasyEquities</td>
                <td className="py-3 px-2">R1</td>
                <td className="py-3 px-2">0.25%</td>
                <td className="py-3 px-2 text-emerald-400">Yes</td>
                <td className="py-3 px-2">Starting out, micro-investing</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-2 font-medium">FNB Share Investing</td>
                <td className="py-3 px-2">R35 min fee</td>
                <td className="py-3 px-2">R35 or 0.25%</td>
                <td className="py-3 px-2 text-emerald-400">Yes</td>
                <td className="py-3 px-2">Larger trades (R10K+)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-2 font-medium">Satrix</td>
                <td className="py-3 px-2">R300</td>
                <td className="py-3 px-2">0.10-0.35%</td>
                <td className="py-3 px-2 text-emerald-400">Yes</td>
                <td className="py-3 px-2">Index funds, passive</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium">Interactive Brokers</td>
                <td className="py-3 px-2">$1</td>
                <td className="py-3 px-2">$1 or less</td>
                <td className="py-3 px-2 text-red-400">No</td>
                <td className="py-3 px-2">International (Phase 3+)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          Start with EasyEquities TFSA. The R36,000/year tax-free limit means your first ~R3K/month of investments grow completely tax-free.
        </p>
      </div>
    </div>
  );
}
