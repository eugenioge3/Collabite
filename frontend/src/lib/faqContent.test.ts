import { describe, expect, it } from 'vitest';
import { FAQ_ITEMS } from './faqContent';

describe('faqContent coverage', () => {
  it('contains between 8 and 12 public FAQ entries', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(8);
    expect(FAQ_ITEMS.length).toBeLessThanOrEqual(12);
  });

  it('includes payment, unlock, and security topics', () => {
    const combined = FAQ_ITEMS.map((item) => `${item.question} ${item.answer}`.toLowerCase()).join(' ');

    expect(combined).toMatch(/pago|pagar|escrow/);
    expect(combined).toMatch(/desbloqueo|desbloquear/);
    expect(combined).toMatch(/seguridad|proteg/);
  });
});
