import { getApiErrorDetail, getApiErrorStatus } from './apiError';

export function translateLoginError(err: unknown): string {
  const detail = getApiErrorDetail(err) || '';

  if (getApiErrorStatus(err) === 403 && detail.includes('not verified')) {
    return 'Tu correo no está verificado. Revisa tu bandeja de entrada o';
  }

  if (detail.includes('NotAuthorizedException') || detail.includes('Invalid email or password')) {
    return 'Correo o contraseña incorrectos.';
  }

  if (detail.includes('UserNotFoundException')) {
    return 'No existe una cuenta con ese correo.';
  }

  if (detail.includes('UserNotConfirmedException')) {
    return 'Tu correo no está verificado. Revisa tu bandeja de entrada o';
  }

  return detail || 'Ocurrió un error. Inténtalo de nuevo.';
}

export function shouldPromptEmailVerification(err: unknown, translatedMessage: string): boolean {
  return getApiErrorStatus(err) === 403 || translatedMessage.includes('no está verificado');
}

export function translateRegisterError(err: unknown): string {
  const detail = getApiErrorDetail(err) || '';

  if (detail.includes('already exists') || detail.includes('UsernameExistsException')) {
    return 'Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?';
  }

  if (detail.includes('Password did not conform') || (detail.includes('password') && detail.includes('policy'))) {
    return 'La contraseña no cumple los requisitos: mínimo 8 caracteres, mayúsculas, minúsculas, número y símbolo.';
  }

  if (detail.includes('Invalid email')) {
    return 'Correo electrónico no válido.';
  }

  return detail || 'Ocurrió un error. Inténtalo de nuevo.';
}

export function translateVerifyEmailError(err: unknown): string {
  const detail = getApiErrorDetail(err) || '';

  if (detail.includes('CodeMismatchException') || detail.includes('Invalid verification code')) {
    return 'Código incorrecto. Revisa el correo e inténtalo de nuevo.';
  }

  if (detail.includes('ExpiredCodeException') || detail.includes('expired')) {
    return 'El código expiró. Solicita uno nuevo abajo.';
  }

  return detail || 'Error al verificar. Inténtalo de nuevo.';
}