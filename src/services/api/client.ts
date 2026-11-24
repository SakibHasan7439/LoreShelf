import { getApiUrl } from '@/config/api';
import type {
  ApiErrorResponse,
  ApiSuccess,
  AuthTokenPair,
  RefreshRequest,
} from '@/types/api';
import { clearAuthTokens, readAuthTokens, saveAuthTokens } from '@/services/auth/tokenStorage';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  /** Attach the current bearer token and refresh/retry once after a 401. */
  authenticated?: boolean;
  /** JSON value to serialize as the request body. */
  body?: unknown;
  headers?: HeadersInit;
}

let refreshInFlight: Promise<boolean> | null = null;

function requestUrl(path: string): string {
  try {
    return getApiUrl(path);
  } catch (error) {
    throw new ApiError(0, 'API_NOT_CONFIGURED', error instanceof Error ? error.message : 'API URL is not configured.');
  }
}

async function responsePayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (!response.ok) return null;
    throw new ApiError(response.status, 'INVALID_API_RESPONSE', 'The server returned an invalid JSON response.');
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (value === null || typeof value !== 'object' || !('error' in value)) return false;
  const error = value.error;
  return error !== null && typeof error === 'object' &&
    'code' in error && typeof error.code === 'string' &&
    'message' in error && typeof error.message === 'string';
}

function toApiError(response: Response, payload: unknown): ApiError {
  if (isApiErrorResponse(payload)) {
    return new ApiError(response.status, payload.error.code, payload.error.message, payload.error.details);
  }
  return new ApiError(response.status, 'HTTP_ERROR', response.statusText || 'The request failed.');
}

async function fetchJsonResponse(path: string, options: ApiRequestOptions, accessToken?: string): Promise<Response> {
  const { authenticated: _authenticated, body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has('content-type')) {
    requestHeaders.set('content-type', 'application/json');
  }
  requestHeaders.set('accept', 'application/json');
  if (accessToken) requestHeaders.set('authorization', `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(requestUrl(path), {
      ...init,
      headers: requestHeaders,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    throw new ApiError(0, 'NETWORK_ERROR', error instanceof Error ? error.message : 'Unable to reach the LoreShelf API.');
  }
  return response;
}

async function refreshAccessToken(failedAccessToken: string | undefined): Promise<boolean> {
  const currentTokens = await readAuthTokens();
  if (!currentTokens?.refreshToken) return false;
  // A concurrent request may already have refreshed this request's token.
  if (failedAccessToken && currentTokens.accessToken !== failedAccessToken) return true;
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = currentTokens.refreshToken;
  const refreshTask = (async () => {
    try {
      const response = await fetchJsonResponse('/auth/refresh', {
        method: 'POST',
        body: { refreshToken } satisfies RefreshRequest,
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw toApiError(response, payload);
      if (payload === null || typeof payload !== 'object' || !('data' in payload)) {
        throw new ApiError(response.status, 'INVALID_API_RESPONSE', 'The server returned an invalid refresh response.');
      }
      const tokens = (payload as ApiSuccess<AuthTokenPair>).data;
      if (typeof tokens?.accessToken !== 'string' || typeof tokens.refreshToken !== 'string') {
        throw new ApiError(response.status, 'INVALID_API_RESPONSE', 'The server returned invalid authentication tokens.');
      }
      await saveAuthTokens(tokens);
      return true;
    } catch (error) {
      // Refresh tokens rotate on use; discard a possibly consumed token after failure.
      await clearAuthTokens();
      throw error;
    }
  })();
  refreshInFlight = refreshTask;
  try {
    return await refreshTask;
  } finally {
    if (refreshInFlight === refreshTask) refreshInFlight = null;
  }
}

/** Sends a JSON request and unwraps the backend's `{ success, data }` envelope. */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const authenticated = options.authenticated ?? false;
  const initialTokens = authenticated ? await readAuthTokens() : null;
  const response = await fetchJsonResponse(path, options, initialTokens?.accessToken);
  const payload = await responsePayload(response);

  if (response.status === 401 && authenticated && path.replace(/^\/+/, '') !== 'auth/refresh') {
    const refreshed = await refreshAccessToken(initialTokens?.accessToken);
    if (refreshed) {
      const newTokens = await readAuthTokens();
      const retryResponse = await fetchJsonResponse(path, options, newTokens?.accessToken);
      const retryPayload = await responsePayload(retryResponse);
      if (!retryResponse.ok) throw toApiError(retryResponse, retryPayload);
      if (retryPayload === null || typeof retryPayload !== 'object' || !('data' in retryPayload)) {
        throw new ApiError(retryResponse.status, 'INVALID_API_RESPONSE', 'The server returned an invalid API response.');
      }
      return (retryPayload as ApiSuccess<T>).data;
    }
  }

  if (!response.ok) throw toApiError(response, payload);
  if (payload === null || typeof payload !== 'object' || !('data' in payload)) {
    throw new ApiError(response.status, 'INVALID_API_RESPONSE', 'The server returned an invalid API response.');
  }
  return (payload as ApiSuccess<T>).data;
}

/** Save tokens returned by `/auth/login` or `/auth/register`. */
export { saveAuthTokens, clearAuthTokens };
