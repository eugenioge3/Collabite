export type PilotSupportChannel = {
  emailUrl: string;
  emailLabel: string;
  responseTimeGoal: string;
  supportOwner: string;
  upcomingAutomationNote: string;
};

function normalizeEmail(value: string | undefined): string {
  return value?.trim() || 'soporte@collabite.mx';
}

const supportEmail = normalizeEmail(import.meta.env.VITE_SUPPORT_EMAIL);
const supportOwner = import.meta.env.VITE_SUPPORT_OWNER?.trim() || 'Eugenio (Founder) durante piloto';
const responseTimeGoal = import.meta.env.VITE_SUPPORT_RESPONSE_TIME?.trim()
  || 'Respuesta inicial en menos de 15 minutos (L-V, 9:00 a 19:00, hora CDMX).';
const upcomingAutomationNote = import.meta.env.VITE_SUPPORT_UPCOMING_AUTOMATION?.trim()
  || 'Proximamente: chatbot con AI para soporte guiado 24/7.';

export const PILOT_SUPPORT_CHANNEL: PilotSupportChannel = {
  emailUrl: `mailto:${supportEmail}?subject=${encodeURIComponent('Soporte Collabite')}`,
  emailLabel: supportEmail,
  responseTimeGoal,
  supportOwner,
  upcomingAutomationNote,
};
