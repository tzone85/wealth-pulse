import { describe, expect, it } from 'vitest';

import { createInvestmentPlan, projectLumpSum } from './engine';

const baseInput = {
  lumpSum: 250_000,
  horizonYears: 15 as const,
  riskProfile: 'balanced' as const,
  tfsaContributedThisYear: 0,
  tfsaLifetimeContributions: 0,
  hasEmergencyFund: true,
  hasHighInterestDebt: false,
  needsEarlyAccess: false,
};

describe('createInvestmentPlan', () => {
  it('builds a diversified 15-year allocation that totals 100%', () => {
    const plan = createInvestmentPlan(baseInput);

    expect(plan.status).toBe('ready');
    expect(plan.allocation.reduce((total, item) => total + item.percentage, 0)).toBe(100);
    expect(plan.allocation.find((item) => item.assetClass === 'Global equity')?.percentage).toBe(60);
    expect(plan.allocation.find((item) => item.assetClass === 'SA equity')?.percentage).toBe(20);
  });

  it('reduces equity exposure for a 10-year goal', () => {
    const fifteenYearPlan = createInvestmentPlan(baseInput);
    const tenYearPlan = createInvestmentPlan({ ...baseInput, horizonYears: 10 });

    expect(tenYearPlan.equityPercentage).toBeLessThan(fifteenYearPlan.equityPercentage);
    expect(tenYearPlan.allocation.reduce((total, item) => total + item.percentage, 0)).toBe(100);
  });

  it('uses only the remaining annual and lifetime TFSA allowances', () => {
    const plan = createInvestmentPlan({
      ...baseInput,
      lumpSum: 100_000,
      tfsaContributedThisYear: 20_000,
      tfsaLifetimeContributions: 490_000,
    });

    expect(plan.wrappers.tfsaNow).toBe(10_000);
    expect(plan.wrappers.discretionaryNow).toBe(90_000);
  });

  it('does not recommend investing before expensive debt and cash-buffer risks are addressed', () => {
    const plan = createInvestmentPlan({
      ...baseInput,
      hasEmergencyFund: false,
      hasHighInterestDebt: true,
    });

    expect(plan.status).toBe('pause');
    expect(plan.blockers).toHaveLength(2);
  });

  it('rejects invalid amounts and unsupported horizons', () => {
    expect(() => createInvestmentPlan({ ...baseInput, lumpSum: 0 })).toThrow('Lump sum must be greater than zero');
    expect(() => createInvestmentPlan({ ...baseInput, horizonYears: 12 as 10 })).toThrow('Horizon must be 10 or 15 years');
  });
});

describe('projectLumpSum', () => {
  it('compounds a lump sum without pretending the result is guaranteed', () => {
    const projection = projectLumpSum(100_000, 10, 0.08, 0.045);

    expect(projection.nominalValue).toBeCloseTo(215_892.50, 1);
    expect(projection.todayMoneyValue).toBeLessThan(projection.nominalValue);
    expect(projection.isGuaranteed).toBe(false);
  });
});

describe('createDualGoalPlan', () => {
  it('shares one TFSA allowance across both goals instead of double counting it', async () => {
    const { createDualGoalPlan } = await import('./engine');
    const dualPlan = createDualGoalPlan({
      fifteenYear: baseInput,
      tenYear: { ...baseInput, lumpSum: 150_000, horizonYears: 10 },
    });

    expect(dualPlan.fifteenYear.wrappers.tfsaNow).toBe(46_000);
    expect(dualPlan.tenYear.wrappers.tfsaNow).toBe(0);
    expect(
      dualPlan.fifteenYear.wrappers.tfsaNow + dualPlan.tenYear.wrappers.tfsaNow,
    ).toBeLessThanOrEqual(46_000);
  });
});
