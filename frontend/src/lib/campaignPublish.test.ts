import { describe, expect, it } from 'vitest';
import { getPublishCampaignValidationMessage } from './campaignPublish';

describe('campaignPublish validation', () => {
  it('requires title before publishing', () => {
    const message = getPublishCampaignValidationMessage({
      title: '   ',
      budget: '1000',
      city: 'Cancun',
      niche_required: 'food',
    });

    expect(message).toBe('Completa el titulo antes de publicar.');
  });

  it('requires positive budget before publishing', () => {
    const message = getPublishCampaignValidationMessage({
      title: 'Campana demo',
      budget: '0',
      city: 'Cancun',
      niche_required: 'food',
    });

    expect(message).toBe('Ingresa un presupuesto valido mayor a 0.');
  });

  it('requires city before publishing', () => {
    const message = getPublishCampaignValidationMessage({
      title: 'Campana demo',
      budget: '1000',
      city: ' ',
      niche_required: 'food',
    });

    expect(message).toBe('La ciudad es obligatoria para publicar.');
  });

  it('requires niche before publishing', () => {
    const message = getPublishCampaignValidationMessage({
      title: 'Campana demo',
      budget: '1000',
      city: 'Cancun',
      niche_required: '',
    });

    expect(message).toBe('Selecciona un nicho antes de publicar.');
  });

  it('returns null when campaign is publish-ready', () => {
    const message = getPublishCampaignValidationMessage({
      title: 'Campana demo',
      budget: '1000',
      city: 'Cancun',
      niche_required: 'food',
    });

    expect(message).toBeNull();
  });
});
