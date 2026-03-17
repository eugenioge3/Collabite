import type { Niche } from './types';

export type CampaignPublishValidationInput = {
  title: string;
  budget: string;
  city: string;
  niche_required: Niche | '';
};

export function getPublishCampaignValidationMessage(input: CampaignPublishValidationInput): string | null {
  if (!input.title.trim()) {
    return 'Completa el titulo antes de publicar.';
  }

  const budget = Number(input.budget);
  if (!Number.isFinite(budget) || budget <= 0) {
    return 'Ingresa un presupuesto valido mayor a 0.';
  }

  if (!input.city.trim()) {
    return 'La ciudad es obligatoria para publicar.';
  }

  if (!input.niche_required) {
    return 'Selecciona un nicho antes de publicar.';
  }

  return null;
}
