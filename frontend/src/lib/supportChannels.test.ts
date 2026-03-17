import { describe, expect, it } from 'vitest';
import { PILOT_SUPPORT_CHANNEL } from './supportChannels';

describe('supportChannels', () => {
  it('builds a visible email support channel only', () => {
    const supportChannelKeys = Object.keys(PILOT_SUPPORT_CHANNEL).sort();

    expect(supportChannelKeys).toEqual([
      'emailLabel',
      'emailUrl',
      'responseTimeGoal',
      'supportOwner',
      'upcomingAutomationNote',
    ]);
    expect(PILOT_SUPPORT_CHANNEL.emailUrl).toMatch(/^mailto:/);
    expect(PILOT_SUPPORT_CHANNEL.emailLabel).toMatch(/@/);
  });

  it('defines response target, pilot owner, and upcoming AI chatbot support', () => {
    const supportMeta = `${PILOT_SUPPORT_CHANNEL.responseTimeGoal} ${PILOT_SUPPORT_CHANNEL.supportOwner}`.toLowerCase();
    const upcomingSupport = PILOT_SUPPORT_CHANNEL.upcomingAutomationNote.toLowerCase();

    expect(supportMeta).toMatch(/respuesta|minutos|hora/);
    expect(supportMeta).toMatch(/piloto|founder|soporte|eugenio/);
    expect(upcomingSupport).toMatch(/chatbot|ai/);
  });
});
