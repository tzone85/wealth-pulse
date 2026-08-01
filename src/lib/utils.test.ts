import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatPercent, cn } from './utils';

describe('formatCurrency', () => {
  it('formats ZAR with R prefix', () => {
    expect(formatCurrency(1500)).toMatch(/^R1[\s,.]500$/);
  });

  it('formats USD with $ prefix and cents', () => {
    expect(formatCurrency(1500, 'USD')).toBe('$1,500.00');
  });
});

describe('formatPercent', () => {
  it('adds a plus sign for gains', () => {
    expect(formatPercent(1.234)).toBe('+1.23%');
  });

  it('keeps the minus sign for losses', () => {
    expect(formatPercent(-0.5)).toBe('-0.50%');
  });
});

describe('formatNumber', () => {
  it('respects the decimals argument', () => {
    expect(formatNumber(1234.567, 0)).toBe('1,235');
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
  });
});

describe('cn', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cn('a', false, undefined, 'b', null)).toBe('a b');
  });
});
