import type { Currency } from './types';

type CampaignPaymentInput = {
  budget: number;
  currency: Currency;
};

export type CampaignPaymentSummary = {
  budget: number;
  commission: number;
  paymentFee: number;
  total: number;
  commissionRate: number;
  paymentFeeRate: number;
  paymentFeeFixed: number;
};

const COMMISSION_RATE = 0.2;
const PAYMENT_FEE_RATE_BY_CURRENCY: Record<Currency, number> = {
  MXN: 0.036,
  USD: 0.029,
};
const PAYMENT_FEE_FIXED_BY_CURRENCY: Record<Currency, number> = {
  MXN: 3,
  USD: 0.3,
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getCampaignPaymentSummary(input: CampaignPaymentInput): CampaignPaymentSummary {
  const safeBudget = Math.max(0, Number.isFinite(input.budget) ? input.budget : 0);
  const paymentFeeRate = PAYMENT_FEE_RATE_BY_CURRENCY[input.currency];
  const paymentFeeFixed = PAYMENT_FEE_FIXED_BY_CURRENCY[input.currency];

  const commission = roundMoney(safeBudget * COMMISSION_RATE);
  const paymentFee = safeBudget > 0
    ? roundMoney((safeBudget * paymentFeeRate) + paymentFeeFixed)
    : 0;
  const total = roundMoney(safeBudget + commission + paymentFee);

  return {
    budget: roundMoney(safeBudget),
    commission,
    paymentFee,
    total,
    commissionRate: COMMISSION_RATE,
    paymentFeeRate,
    paymentFeeFixed,
  };
}
