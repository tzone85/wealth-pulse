'use client';

import { formatPercent, cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changePercent?: number;
  icon?: ReactNode;
  subtitle?: string;
}

export default function MetricCard({ title, value, change, changePercent, icon, subtitle }: MetricCardProps) {
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-zinc-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {changePercent !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                'text-sm font-semibold px-2 py-0.5 rounded-md',
                isPositive ? 'text-emerald-400 bg-emerald-950' : 'text-red-400 bg-red-950'
              )}>
                {formatPercent(changePercent)}
              </span>
              {change !== undefined && (
                <span className="text-xs text-zinc-500">
                  {isPositive ? '+' : ''}{typeof change === 'number' ? change.toFixed(2) : change}
                </span>
              )}
            </div>
          )}
          {subtitle && <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-zinc-600 ml-3">{icon}</div>
        )}
      </div>
    </div>
  );
}
