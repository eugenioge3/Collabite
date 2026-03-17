import type { CampaignStatus } from './types';

export type CampaignPrimaryAction =
  | 'publish'
  | 'fund_escrow'
  | 'review_applications'
  | 'none';

export type CampaignStatusMeta = {
  label: string;
  badgeClassName: string;
  nextStep: string;
  ctaLabel: string;
  primaryAction: CampaignPrimaryAction;
};

const STATUS_META: Record<CampaignStatus, CampaignStatusMeta> = {
  draft: {
    label: 'Draft',
    badgeClassName: 'bg-gray-100 text-gray-600',
    nextStep: 'Completa los datos minimos y publica para empezar a recibir postulaciones.',
    ctaLabel: 'Publicar campana',
    primaryAction: 'publish',
  },
  active: {
    label: 'Activa',
    badgeClassName: 'bg-green-100 text-green-700',
    nextStep: 'Fondea el escrow para desbloquear la gestion de candidatas.',
    ctaLabel: 'Fondear y desbloquear',
    primaryAction: 'fund_escrow',
  },
  funded: {
    label: 'Fondeada',
    badgeClassName: 'bg-blue-100 text-blue-700',
    nextStep: 'Ya puedes revisar y decidir sobre las postulaciones recibidas.',
    ctaLabel: 'Revisar postulaciones',
    primaryAction: 'review_applications',
  },
  in_progress: {
    label: 'En curso',
    badgeClassName: 'bg-yellow-100 text-yellow-700',
    nextStep: 'Da seguimiento a la colaboracion y valida entregables.',
    ctaLabel: 'Gestionar colaboracion',
    primaryAction: 'review_applications',
  },
  completed: {
    label: 'Completada',
    badgeClassName: 'bg-indigo-100 text-indigo-700',
    nextStep: 'Campana cerrada. Revisa resultados y aprendizajes para la siguiente.',
    ctaLabel: 'Ver detalle',
    primaryAction: 'none',
  },
  canceled: {
    label: 'Cancelada',
    badgeClassName: 'bg-red-100 text-red-700',
    nextStep: 'Campana cancelada. Puedes crear una nueva cuando estes lista.',
    ctaLabel: 'Ver detalle',
    primaryAction: 'none',
  },
  disputed: {
    label: 'En disputa',
    badgeClassName: 'bg-orange-100 text-orange-700',
    nextStep: 'Hay una disputa activa. Revisa el detalle y define siguiente paso.',
    ctaLabel: 'Revisar disputa',
    primaryAction: 'none',
  },
};

export function getCampaignStatusMeta(status: CampaignStatus): CampaignStatusMeta {
  return STATUS_META[status];
}
