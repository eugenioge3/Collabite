import { describe, expect, it } from 'vitest';
import { getCampaignStatusMeta } from './campaignStatus';

describe('campaignStatus helpers', () => {
  it('returns publish CTA metadata for draft campaigns', () => {
    const status = getCampaignStatusMeta('draft');

    expect(status.label).toBe('Draft');
    expect(status.primaryAction).toBe('publish');
    expect(status.ctaLabel).toBe('Publicar campana');
  });

  it('returns funding CTA metadata for active campaigns', () => {
    const status = getCampaignStatusMeta('active');

    expect(status.label).toBe('Activa');
    expect(status.primaryAction).toBe('fund_escrow');
    expect(status.ctaLabel).toBe('Fondear y desbloquear');
  });

  it('returns review CTA metadata for funded and in-progress campaigns', () => {
    expect(getCampaignStatusMeta('funded').primaryAction).toBe('review_applications');
    expect(getCampaignStatusMeta('in_progress').primaryAction).toBe('review_applications');
  });

  it('returns no pending action for terminal states', () => {
    expect(getCampaignStatusMeta('completed').primaryAction).toBe('none');
    expect(getCampaignStatusMeta('canceled').primaryAction).toBe('none');
    expect(getCampaignStatusMeta('disputed').primaryAction).toBe('none');
  });
});
