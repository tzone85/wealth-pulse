'use client';

import { getOpportunities } from '@/lib/market-data';
import { cn } from '@/lib/utils';
import { ExternalLink, Briefcase, Bug, Wallet } from 'lucide-react';

const typeIcons = {
  freelance: Briefcase,
  bounty: Bug,
  passive: Wallet,
};

const typeColors = {
  freelance: 'text-blue-400 bg-blue-950',
  bounty: 'text-purple-400 bg-purple-950',
  passive: 'text-emerald-400 bg-emerald-950',
};

const difficultyColors = {
  easy: 'text-emerald-400 bg-emerald-950/50',
  medium: 'text-amber-400 bg-amber-950/50',
  hard: 'text-red-400 bg-red-950/50',
};

export default function Opportunities() {
  const opportunities = getOpportunities();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-1">Income Opportunities</h3>
      <p className="text-sm text-zinc-400 mb-6">Platforms and strategies to grow your income</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp) => {
          const Icon = typeIcons[opp.type];
          return (
            <div
              key={opp.name}
              className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn('p-1.5 rounded-md', typeColors[opp.type])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-white">{opp.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', difficultyColors[opp.difficulty])}>
                    {opp.difficulty}
                  </span>
                </div>
              </div>
              <p className="text-sm text-emerald-400 font-medium mb-1">{opp.estimatedEarnings}</p>
              <p className="text-xs text-zinc-400 mb-3">{opp.description}</p>
              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
