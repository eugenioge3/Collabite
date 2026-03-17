import { describe, expect, it } from 'vitest';
import {
  getMexicoCitiesByState,
  getMexicoStateOptions,
  normalizeMexicoLocationSelection,
} from './mxLocations';

describe('mxLocations helpers', () => {
  it('normalizes CDMX aliases and infers state from city alias', () => {
    const normalized = normalizeMexicoLocationSelection('', 'CDMX');

    expect(normalized.city).toBe('Ciudad de Mexico');
    expect(normalized.state).toBe('Ciudad de Mexico');
  });

  it('normalizes district federal state aliases', () => {
    const normalized = normalizeMexicoLocationSelection('distrito federal', 'Ciudad de Mexico');

    expect(normalized.state).toBe('Ciudad de Mexico');
    expect(normalized.city).toBe('Ciudad de Mexico');
  });

  it('returns cities for a selected state and preserves unknown existing city', () => {
    const cities = getMexicoCitiesByState('Quintana Roo', 'Puerto Morelos');

    expect(cities[0]).toBe('Puerto Morelos');
    expect(cities).toContain('Cancun');
  });

  it('includes current unknown state in state options', () => {
    const states = getMexicoStateOptions('Estado Inventado');

    expect(states[0]).toBe('Estado Inventado');
    expect(states).toContain('Ciudad de Mexico');
  });
});
