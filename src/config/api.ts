const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

/** Backend API root, including the backend's `/api` prefix. */
export const API_BASE_URL = configuredApiUrl?.replace(/\/+$/u, '') ?? '';

export function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured. Set it in the frontend .env file.');
  }

  try {
    const parsed = new URL(API_BASE_URL);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Unsupported protocol.');
    if (!parsed.pathname.replace(/\/+$/u, '').endsWith('/api')) throw new Error('Missing API prefix.');
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL must be a valid HTTP(S) URL ending in /api.');
  }

  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}
