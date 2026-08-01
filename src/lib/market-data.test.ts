import { describe, it, expect } from 'vitest';
import {
  calculateCompoundGrowth,
  getMarketIndices,
  getCurrencyPairs,
  getCommodities,
  getZARHistory,
  getJSEHistory,
  getGoldHistory,
  getPlatinumHistory,
  getSnapshotUpdatedAt,
} from './market-data';

describe('calculateCompoundGrowth', () => {
  it('starts at the initial amount with no growth at month 0', () => {
    const [first] = calculateCompoundGrowth(1000, 100, 12);
    expect(first.month).toBe(0);
    expect(first.invested).toBe(1000);
    expect(first.conservative).toBe(1000);
    expect(first.moderate).toBe(1000);
    expect(first.aggressive).toBe(1000);
  });

  it('returns months + 1 rows', () => {
    expect(calculateCompoundGrowth(100, 100, 24)).toHaveLength(25);
  });

  it('tracks invested capital as initial + monthly * month', () => {
    const results = calculateCompoundGrowth(500, 250, 6);
    expect(results[6].invested).toBe(500 + 250 * 6);
  });

  it('grows faster at higher rates', () => {
    const results = calculateCompoundGrowth(1000, 100, 36);
    const last = results[results.length - 1];
    expect(last.aggressive).toBeGreaterThan(last.moderate);
    expect(last.moderate).toBeGreaterThan(last.conservative);
    expect(last.conservative).toBeGreaterThan(last.invested);
  });

  it('compounds a lump sum correctly at 10% annual', () => {
    const results = calculateCompoundGrowth(10000, 0, 12);
    // 10% annual compounded monthly: 10000 * (1 + 0.10/12)^12
    const expected = 10000 * Math.pow(1 + 0.1 / 12, 12);
    expect(results[12].moderate).toBeCloseTo(expected, 1);
  });
});

// These tests guard the market snapshot: if the refresh cron ever commits
// malformed data, CI fails before it can break the deployed site.
describe('market snapshot', () => {
  it('has a valid updatedAt timestamp', () => {
    expect(Number.isNaN(Date.parse(getSnapshotUpdatedAt()))).toBe(false);
  });

  it('has positive, finite values for all indices', () => {
    const indices = getMarketIndices();
    expect(indices.length).toBeGreaterThan(0);
    for (const idx of indices) {
      expect(idx.value, idx.symbol).toBeGreaterThan(0);
      expect(Number.isFinite(idx.change), idx.symbol).toBe(true);
    }
  });

  it('quotes all currency pairs as ZAR per foreign unit', () => {
    const pairs = getCurrencyPairs();
    const names = pairs.map((p) => p.pair);
    expect(names).toContain('USD/ZAR');
    for (const fx of pairs) {
      expect(fx.pair.endsWith('/ZAR'), fx.pair).toBe(true);
      // ZAR per major currency has been > 1 for decades; catches inverted rates.
      expect(fx.rate, fx.pair).toBeGreaterThan(1);
    }
  });

  it('has positive prices for all commodities', () => {
    for (const c of getCommodities()) {
      expect(c.price, c.symbol).toBeGreaterThan(0);
    }
  });

  it('has chronologically ordered history series', () => {
    for (const series of [getZARHistory(), getJSEHistory(), getGoldHistory(), getPlatinumHistory()]) {
      expect(series.length).toBeGreaterThanOrEqual(12);
      const dates = series.map((p) => p.date);
      expect([...dates].sort()).toEqual(dates);
      for (const point of series) {
        expect(point.value).toBeGreaterThan(0);
        expect(point.date).toMatch(/^\d{4}-\d{2}$/);
      }
    }
  });
});
