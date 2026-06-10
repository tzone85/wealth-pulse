import type {
  MarketIndex,
  CurrencyPair,
  Commodity,
  HistoricalPoint,
  MarketSnapshot,
  CompoundResult,
  PhaseInfo,
  OpportunityPlatform,
} from '@/types/market';
import snapshotJson from '@/data/market-snapshot.json';

// Market data is read from a JSON snapshot that is refreshed automatically
// by .github/workflows/refresh-market-data.yml (see docs/Market-Data-Pipeline.md).
const snapshot = snapshotJson as MarketSnapshot;

export function getSnapshotUpdatedAt(): string {
  return snapshot.updatedAt;
}

export function getMarketIndices(): MarketIndex[] {
  return snapshot.indices;
}

export function getCurrencyPairs(): CurrencyPair[] {
  return snapshot.currencies;
}

export function getCommodities(): Commodity[] {
  return snapshot.commodities;
}

export function getZARHistory(): HistoricalPoint[] {
  return snapshot.history.usdZar;
}

export function getJSEHistory(): HistoricalPoint[] {
  return snapshot.history.jseTop40;
}

export function getGoldHistory(): HistoricalPoint[] {
  return snapshot.history.gold;
}

export function getPlatinumHistory(): HistoricalPoint[] {
  return snapshot.history.platinum;
}

export function calculateCompoundGrowth(
  initial: number,
  monthly: number,
  months: number,
): CompoundResult[] {
  const rates = {
    conservative: 0.07,  // 7% annual
    moderate: 0.10,       // 10% annual
    aggressive: 0.15,     // 15% annual
  };

  const results: CompoundResult[] = [];

  for (let m = 0; m <= months; m++) {
    const invested = initial + monthly * m;

    const calc = (annualRate: number) => {
      const monthlyRate = annualRate / 12;
      let total = initial * Math.pow(1 + monthlyRate, m);
      if (monthly > 0 && m > 0) {
        total += monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
      }
      return Math.round(total * 100) / 100;
    };

    results.push({
      month: m,
      invested,
      conservative: calc(rates.conservative),
      moderate: calc(rates.moderate),
      aggressive: calc(rates.aggressive),
    });
  }

  return results;
}

export function getPhases(): PhaseInfo[] {
  return [
    {
      phase: 0,
      title: 'Stop the Bleeding',
      range: 'NOW',
      description: 'Stabilize finances. Optimize rental business. Map all debt.',
      actions: [
        'Optimize Airbnb listing (photos, pricing, description)',
        'Map ALL debt — interest rates, minimums, penalties',
        'Attack highest-interest debt first (avalanche method)',
        'No trading yet — cannot afford losses'
      ],
      rules: ['Do NOT trade with money owed to creditors', 'Rental business is priority #1'],
      status: 'current',
    },
    {
      phase: 1,
      title: 'First R1,000',
      range: 'R100 → R1,000',
      description: 'Build the habit. Learn without losing.',
      actions: [
        'Open EasyEquities TFSA account',
        'Start with R100 — buy STX40 + STXWDM',
        'Paper trade on TradingView to learn',
        'Daily 30 min learning: markets, charts, fundamentals',
      ],
      rules: ['No leveraged trades', 'No margin', 'No crypto gambling', 'Reinvest every gain'],
      status: 'upcoming',
    },
    {
      phase: 2,
      title: 'Building Confidence',
      range: 'R1,000 → R10,000',
      description: 'Small live trades. Track everything.',
      actions: [
        'Begin small trades — max 5% per position',
        'Track every trade: entry, exit, outcome',
        'Diversify across ZAR and USD assets',
        'Funnel rental surplus into investments',
      ],
      rules: ['Max 5% per position', 'Track every rand in and out'],
      status: 'upcoming',
    },
    {
      phase: 3,
      title: 'Compounding',
      range: 'R10,000 → R100,000',
      description: 'Systematic strategies. International diversification.',
      actions: [
        'Tighten risk — max 2-3% per position',
        'Introduce systematic/algorithmic strategies',
        'International diversification: US, emerging markets',
        'Build passive income streams alongside trading',
      ],
      rules: ['Risk % decreases as portfolio grows', 'Never neglect rental for trading dopamine'],
      status: 'upcoming',
    },
    {
      phase: 4,
      title: 'Portfolio Mode',
      range: 'R100,000 → R1,000,000+',
      description: 'Multiple asset classes. Professional tools.',
      actions: [
        'Multiple asset classes: equities, property, forex, commodities',
        'Professional-grade tools and analysis',
        'Investment vehicles: funds, startups, partnerships',
        'International brokerage accounts fully active',
      ],
      rules: ['Protect gains', 'Portfolio sustains family independently'],
      status: 'upcoming',
    },
    {
      phase: 5,
      title: 'Abundance',
      range: 'R1,000,000+',
      description: 'Give back. Invest in others. Build legacy.',
      actions: [
        'Angel investing and venture participation',
        'Education sponsorship fund operational',
        '10% of profits to education fund',
        'Portfolio sustains all family obligations',
      ],
      rules: ['Scale giving with portfolio', 'Target: tuition sponsorships'],
      status: 'upcoming',
    },
  ];
}

export function getOpportunities(): OpportunityPlatform[] {
  return [
    {
      name: 'Toptal',
      type: 'freelance',
      url: 'https://www.toptal.com',
      estimatedEarnings: '$30-80/hr (R555-R1,480/hr)',
      description: 'Top 3% freelance network. Rigorous screening but high-paying clients. Paid in USD.',
      difficulty: 'hard',
    },
    {
      name: 'Upwork',
      type: 'freelance',
      url: 'https://www.upwork.com',
      estimatedEarnings: '$20-60/hr (R370-R1,110/hr)',
      description: 'Largest freelance marketplace. Build reputation over time. Good for starting out.',
      difficulty: 'medium',
    },
    {
      name: 'Turing',
      type: 'freelance',
      url: 'https://www.turing.com',
      estimatedEarnings: '$30-70/hr (R555-R1,295/hr)',
      description: 'AI-matched remote engineering jobs. SA developers welcome. Long-term contracts.',
      difficulty: 'medium',
    },
    {
      name: 'Algora',
      type: 'bounty',
      url: 'https://algora.io',
      estimatedEarnings: '$50-5,000 per bounty',
      description: 'Open source bounties funded by companies. Good for TypeScript/React projects.',
      difficulty: 'medium',
    },
    {
      name: 'IssueHunt',
      type: 'bounty',
      url: 'https://issuehunt.io',
      estimatedEarnings: '$20-500 per issue',
      description: 'Bounties on GitHub issues. Lower amounts but more accessible.',
      difficulty: 'easy',
    },
    {
      name: 'Gitcoin',
      type: 'bounty',
      url: 'https://gitcoin.co',
      estimatedEarnings: '$100-10,000 per grant/bounty',
      description: 'Web3/blockchain bounties and grants. Higher payouts for specialized work.',
      difficulty: 'hard',
    },
    {
      name: 'EasyEquities TFSA',
      type: 'passive',
      url: 'https://www.easyequities.co.za',
      estimatedEarnings: '10-12% annual (tax-free)',
      description: 'Best platform for SA micro-investing. No minimums. Tax-free savings account.',
      difficulty: 'easy',
    },
    {
      name: 'GitHub Sponsors',
      type: 'passive',
      url: 'https://github.com/sponsors',
      estimatedEarnings: 'Variable — build audience first',
      description: 'Get sponsored for open source work. Requires public profile and active repos.',
      difficulty: 'medium',
    },
  ];
}
