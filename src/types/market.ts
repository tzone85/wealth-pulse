export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  currency: string;
}

export interface CurrencyPair {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
}

export interface Commodity {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
}

export interface HistoricalPoint {
  date: string;
  value: number;
}

export interface CompoundResult {
  month: number;
  invested: number;
  conservative: number;
  moderate: number;
  aggressive: number;
}

export interface PhaseInfo {
  phase: number;
  title: string;
  range: string;
  description: string;
  actions: string[];
  rules: string[];
  status: 'current' | 'upcoming' | 'completed';
}

export interface OpportunityPlatform {
  name: string;
  type: 'freelance' | 'bounty' | 'passive';
  url: string;
  estimatedEarnings: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
