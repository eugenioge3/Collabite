import { describe, expect, it } from 'vitest';
import { getApiErrorDetail, getApiErrorMessage, getApiErrorStatus } from './apiError';

describe('apiError helpers', () => {
  it('reads detail from axios-style object payloads', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 403,
        data: {
          detail: 'Forbidden',
        },
      },
    };

    expect(getApiErrorDetail(error)).toBe('Forbidden');
    expect(getApiErrorMessage(error, 'Fallback')).toBe('Forbidden');
    expect(getApiErrorStatus(error)).toBe(403);
  });

  it('supports raw string error payloads', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 400,
        data: 'Bad request',
      },
    };

    expect(getApiErrorDetail(error)).toBe('Bad request');
  });

  it('falls back to the generic message for unknown errors', () => {
    expect(getApiErrorMessage(new Error('Boom'), 'Fallback')).toBe('Boom');
    expect(getApiErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});