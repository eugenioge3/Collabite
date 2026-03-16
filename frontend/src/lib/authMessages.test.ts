import { describe, expect, it } from 'vitest';
import {
  shouldPromptEmailVerification,
  translateLoginError,
  translateRegisterError,
  translateVerifyEmailError,
} from './authMessages';

function axiosLikeError(detail: string, status?: number) {
  return {
    isAxiosError: true,
    message: 'request failed',
    response: {
      status,
      data: { detail },
    },
  };
}

describe('authMessages helpers', () => {
  it('maps login invalid credentials errors', () => {
    const error = axiosLikeError('Invalid email or password', 401);
    expect(translateLoginError(error)).toBe('Correo o contraseña incorrectos.');
  });

  it('detects unverified login situations', () => {
    const error = axiosLikeError('Email not verified. Please check your inbox.', 403);
    const msg = translateLoginError(error);
    expect(shouldPromptEmailVerification(error, msg)).toBe(true);
  });

  it('maps register duplicate email errors', () => {
    const error = axiosLikeError('UsernameExistsException', 409);
    expect(translateRegisterError(error)).toContain('Ya existe una cuenta');
  });

  it('maps register weak password errors', () => {
    const error = axiosLikeError('Password did not conform with policy', 400);
    expect(translateRegisterError(error)).toContain('contraseña no cumple');
  });

  it('maps verify email code mismatch errors', () => {
    const error = axiosLikeError('Invalid verification code', 400);
    expect(translateVerifyEmailError(error)).toContain('Código incorrecto');
  });

  it('maps verify email expired code errors', () => {
    const error = axiosLikeError('Verification code has expired', 400);
    expect(translateVerifyEmailError(error)).toContain('código expiró');
  });
});