'use client';

import Opportunities from '@/components/Opportunities';

export default function OpportunitiesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Opportunities</h1>
        <p className="text-zinc-400 mt-1">Freelancing, bounties, and income diversification</p>
      </div>

      <Opportunities />

      {/* Income Projections */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Realistic Income Projections</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Source</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Monthly (Low)</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Monthly (Mid)</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Monthly (High)</th>
                <th className="text-left py-3 px-2 text-zinc-400 font-medium">Ramp-up</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-2 font-medium">Freelancing (10hr/wk)</td>
                <td className="py-3 px-2 text-zinc-400">R8,000</td>
                <td className="py-3 px-2 text-emerald-400">R18,000</td>
                <td className="py-3 px-2 text-emerald-300">R32,000</td>
                <td className="py-3 px-2 text-xs">2-4 weeks</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-2 font-medium">Rental (Airbnb)</td>
                <td className="py-3 px-2 text-zinc-400">R3,000</td>
                <td className="py-3 px-2 text-emerald-400">R8,000</td>
                <td className="py-3 px-2 text-emerald-300">R15,000</td>
                <td className="py-3 px-2 text-xs">Immediate</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-2 font-medium">Bounties</td>
                <td className="py-3 px-2 text-zinc-400">R0</td>
                <td className="py-3 px-2 text-emerald-400">R3,000</td>
                <td className="py-3 px-2 text-emerald-300">R15,000</td>
                <td className="py-3 px-2 text-xs">Variable</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-2 font-medium">SaaS Products</td>
                <td className="py-3 px-2 text-zinc-400">R0</td>
                <td className="py-3 px-2 text-emerald-400">R5,000</td>
                <td className="py-3 px-2 text-emerald-300">R50,000</td>
                <td className="py-3 px-2 text-xs">1-3 months</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-bold text-white">Total Potential</td>
                <td className="py-3 px-2 font-bold text-zinc-400">R11,000</td>
                <td className="py-3 px-2 font-bold text-emerald-400">R34,000</td>
                <td className="py-3 px-2 font-bold text-emerald-300">R112,000</td>
                <td className="py-3 px-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          The fastest path to wealth is maximizing income (USD freelancing + shipping products), not optimizing returns on R100.
          Invest surplus income consistently via TFSA. Compounding works best with growing contributions.
        </p>
      </div>
    </div>
  );
}
