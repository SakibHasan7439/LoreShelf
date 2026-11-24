import { ApiError } from '@/services/api/client';

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : fallback;
  if (error.code === 'INVALID_CREDENTIALS') return 'That email and password combination was not found.';
  if (error.code === 'EMAIL_ALREADY_REGISTERED') return 'An account with this email already exists.';
  if (error.code === 'TOO_MANY_REQUESTS') return 'Too many attempts. Please wait a little and try again.';
  if (error.code === 'NETWORK_ERROR') return 'Could not reach LoreShelf. Check your connection and try again.';
  if (Array.isArray(error.details)) {
    const messages = error.details.flatMap((detail) =>
      detail !== null && typeof detail === 'object' && 'message' in detail && typeof detail.message === 'string'
        ? [detail.message]
        : [],
    );
    if (messages.length) return messages.slice(0, 2).join(' ');
  }
  return error.message || fallback;
}
