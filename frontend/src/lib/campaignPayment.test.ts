import { describe, expect, it } from 'vitest';
import { getCampaignPaymentSummary } from './campaignPayment';

describe('campaignPayment helpers', () => {
  it('calculates budget, commission, fee, and total for MXN campaigns', () => {
    const summary = getCampaignPaymentSummary({ budget: 1000, currency: 'MXN' });

    expect(summary.budget).toBe(1000);
    expect(summary.commission).toBe(200);
    expect(summary.paymentFee).toBe(39);
    expect(summary.total).toBe(1239);
  });

  it('calculates payment fee using USD percentage and fixed fee', () => {
    const summary = getCampaignPaymentSummary({ budget: 150, currency: 'USD' });

    expect(summary.commission).toBe(30);
    expect(summary.paymentFee).toBe(4.65);
    expect(summary.total).toBe(184.65);
  });

  it('returns zeroed costs when budget is invalid', () => {
    const summary = getCampaignPaymentSummary({ budget: Number.NaN, currency: 'MXN' });

    expect(summary.budget).toBe(0);
    expect(summary.commission).toBe(0);
    expect(summary.paymentFee).toBe(0);
    expect(summary.total).toBe(0);
  });
});
