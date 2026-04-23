'use client';

import { getPhases } from '@/lib/market-data';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

export default function PhaseTracker() {
  const phases = getPhases();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-1">Investment Phases</h3>
      <p className="text-sm text-zinc-400 mb-6">Your roadmap from R100 to R1M+</p>

      <div className="space-y-4">
        {phases.map((phase) => (
          <div
            key={phase.phase}
            className={cn(
              'border rounded-xl p-5 transition-all',
              phase.status === 'current'
                ? 'border-emerald-600 bg-emerald-950/30'
                : phase.status === 'completed'
                ? 'border-zinc-700 bg-zinc-800/50 opacity-60'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {phase.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : phase.status === 'current' ? (
                  <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-semibold text-white">
                    Phase {phase.phase}: {phase.title}
                  </h4>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    phase.status === 'current'
                      ? 'bg-emerald-900 text-emerald-300'
                      : 'bg-zinc-800 text-zinc-400'
                  )}>
                    {phase.range}
                  </span>
                  {phase.status === 'current' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-medium">
                      YOU ARE HERE
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-1">{phase.description}</p>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Actions</p>
                    <ul className="space-y-1">
                      {phase.actions.map((action, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Rules</p>
                    <ul className="space-y-1">
                      {phase.rules.map((rule, i) => (
                        <li key={i} className="text-xs text-amber-300 flex items-start gap-1.5">
                          <span className="text-amber-500 mt-0.5">!</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
