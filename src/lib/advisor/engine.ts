export const TFSA_ANNUAL_LIMIT_2026 = 46_000;
export const TFSA_LIFETIME_LIMIT = 500_000;
export const ASSUMED_INFLATION_RATE = 0.045;

export type HorizonYears = 10 | 15;
export type RiskProfile = 'cautious' | 'balanced' | 'growth';
export type PlanStatus = 'ready' | 'pause';

export interface AdvisorInput {
  lumpSum: number;
  horizonYears: HorizonYears;
  riskProfile: RiskProfile;
  tfsaContributedThisYear: number;
  tfsaLifetimeContributions: number;
  hasEmergencyFund: boolean;
  hasHighInterestDebt: boolean;
  needsEarlyAccess: boolean;
}

export interface AllocationItem {
  assetClass: 'Global equity' | 'SA equity' | 'SA bonds' | 'Cash reserve';
  percentage: number;
  amount: number;
  purpose: string;
}

export interface Projection {
  nominalValue: number;
  todayMoneyValue: number;
  annualReturn: number;
  isGuaranteed: false;
}

export interface InvestmentPlan {
  status: PlanStatus;
  horizonYears: HorizonYears;
  equityPercentage: number;
  allocation: AllocationItem[];
  wrappers: {
    tfsaNow: number;
    discretionaryNow: number;
    annualTfsaRemaining: number;
    lifetimeTfsaRemaining: number;
  };
  blockers: string[];
  projections: {
    cautious: Projection;
    expected: Projection;
    strong: Projection;
  };
  reviewRule: string;
}

export interface DualGoalInput {
  fifteenYear: AdvisorInput;
  tenYear: AdvisorInput;
}

export interface DualGoalPlan {
  fifteenYear: InvestmentPlan;
  tenYear: InvestmentPlan;
  tfsaPriorityReason: string;
}

const purposes: Record<AllocationItem['assetClass'], string> = {
  'Global equity': 'Long-run growth across developed and emerging economies, with rand diversification.',
  'SA equity': 'Home-market growth and rand-linked spending alignment without concentrating the whole portfolio locally.',
  'SA bonds': 'Income and shock absorption when equities fall.',
  'Cash reserve': 'Liquidity for rebalancing and near-term needs; not the long-term growth engine.',
};

const balancedAllocations: Record<HorizonYears, Record<AllocationItem['assetClass'], number>> = {
  10: { 'Global equity': 45, 'SA equity': 20, 'SA bonds': 30, 'Cash reserve': 5 },
  15: { 'Global equity': 60, 'SA equity': 20, 'SA bonds': 15, 'Cash reserve': 5 },
};

function adjustedEquityTarget(horizon: HorizonYears, risk: RiskProfile, needsEarlyAccess: boolean): number {
  const base = horizon === 15 ? 80 : 65;
  const riskAdjustment = risk === 'cautious' ? -20 : risk === 'growth' ? 10 : 0;
  const accessAdjustment = needsEarlyAccess ? -10 : 0;
  return Math.max(35, Math.min(90, base + riskAdjustment + accessAdjustment));
}

function createAllocation(input: AdvisorInput, equityTarget: number): AllocationItem[] {
  const baseline = balancedAllocations[input.horizonYears];
  const baselineEquity = baseline['Global equity'] + baseline['SA equity'];
  const globalShareOfEquity = baseline['Global equity'] / baselineEquity;
  const cash = input.needsEarlyAccess ? 10 : 5;
  const bonds = 100 - equityTarget - cash;
  const globalEquity = Math.round(equityTarget * globalShareOfEquity);
  const saEquity = equityTarget - globalEquity;

  const percentages: Record<AllocationItem['assetClass'], number> = {
    'Global equity': globalEquity,
    'SA equity': saEquity,
    'SA bonds': bonds,
    'Cash reserve': cash,
  };

  return (Object.entries(percentages) as [AllocationItem['assetClass'], number][]).map(
    ([assetClass, percentage]) => ({
      assetClass,
      percentage,
      amount: Math.round((input.lumpSum * percentage) / 100),
      purpose: purposes[assetClass],
    }),
  );
}

export function projectLumpSum(
  lumpSum: number,
  years: number,
  annualReturn: number,
  inflationRate = ASSUMED_INFLATION_RATE,
): Projection {
  const nominalValue = lumpSum * Math.pow(1 + annualReturn, years);
  const todayMoneyValue = nominalValue / Math.pow(1 + inflationRate, years);

  return {
    nominalValue: Math.round(nominalValue * 100) / 100,
    todayMoneyValue: Math.round(todayMoneyValue * 100) / 100,
    annualReturn,
    isGuaranteed: false,
  };
}

export function createDualGoalPlan(input: DualGoalInput): DualGoalPlan {
  const fifteenYear = createInvestmentPlan(input.fifteenYear);
  const tenYear = createInvestmentPlan({
    ...input.tenYear,
    tfsaContributedThisYear:
      input.tenYear.tfsaContributedThisYear + fifteenYear.wrappers.tfsaNow,
    tfsaLifetimeContributions:
      input.tenYear.tfsaLifetimeContributions + fifteenYear.wrappers.tfsaNow,
  });

  return {
    fifteenYear,
    tenYear,
    tfsaPriorityReason:
      'The 15-year goal receives the available TFSA capacity first because its gains have longer to compound tax-free. The two goals share one person’s annual and lifetime limits.',
  };
}

export function createInvestmentPlan(input: AdvisorInput): InvestmentPlan {
  if (!Number.isFinite(input.lumpSum) || input.lumpSum <= 0) {
    throw new Error('Lump sum must be greater than zero');
  }
  if (input.horizonYears !== 10 && input.horizonYears !== 15) {
    throw new Error('Horizon must be 10 or 15 years');
  }

  const blockers: string[] = [];
  if (!input.hasEmergencyFund) {
    blockers.push('Build an accessible emergency reserve before locking this lump sum into volatile assets.');
  }
  if (input.hasHighInterestDebt) {
    blockers.push('Compare the guaranteed saving from clearing expensive debt with uncertain investment returns first.');
  }

  const annualTfsaRemaining = Math.max(0, TFSA_ANNUAL_LIMIT_2026 - input.tfsaContributedThisYear);
  const lifetimeTfsaRemaining = Math.max(0, TFSA_LIFETIME_LIMIT - input.tfsaLifetimeContributions);
  const tfsaNow = Math.min(input.lumpSum, annualTfsaRemaining, lifetimeTfsaRemaining);
  const equityPercentage = adjustedEquityTarget(input.horizonYears, input.riskProfile, input.needsEarlyAccess);
  const expectedReturn = 0.04 + equityPercentage * 0.00065;

  return {
    status: blockers.length > 0 ? 'pause' : 'ready',
    horizonYears: input.horizonYears,
    equityPercentage,
    allocation: createAllocation(input, equityPercentage),
    wrappers: {
      tfsaNow,
      discretionaryNow: input.lumpSum - tfsaNow,
      annualTfsaRemaining,
      lifetimeTfsaRemaining,
    },
    blockers,
    projections: {
      cautious: projectLumpSum(input.lumpSum, input.horizonYears, Math.max(0.04, expectedReturn - 0.025)),
      expected: projectLumpSum(input.lumpSum, input.horizonYears, expectedReturn),
      strong: projectLumpSum(input.lumpSum, input.horizonYears, expectedReturn + 0.025),
    },
    reviewRule: 'Review once a year, rebalance when an asset class drifts by more than 5 percentage points, and de-risk gradually during the final 3 years.',
  };
}
