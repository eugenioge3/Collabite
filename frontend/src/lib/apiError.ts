import axios from 'axios';

type ApiErrorPayload = {
  detail?: string;
};

export function getApiErrorDetail(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorPayload | string | undefined;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object' && typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }

    if (error.message.trim()) {
      return error.message;
    }

    return undefined;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorDetail(error) || fallback;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}