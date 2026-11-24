import { create } from 'zustand';

import { apiRequest, ApiError, saveAuthTokens, clearAuthTokens } from '@/services/api/client';
import { readAuthTokens } from '@/services/auth/tokenStorage';
import type { AuthTokenPair, LoginRequest, RegisterRequest, SafeUser } from '@/types/api';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthState {
  status: AuthStatus;
  user: SafeUser | null;
  restoreError: string | null;
  restoreSession: () => Promise<void>;
  signIn: (input: LoginRequest) => Promise<SafeUser>;
  register: (input: RegisterRequest) => Promise<SafeUser>;
  signOut: () => Promise<void>;
}

let restoreTask: Promise<void> | null = null;

function isRecoverableRestoreError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 0 || error.status >= 500);
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
    return 'Could not reach LoreShelf. Check your connection and API address, then try again.';
  }
  return error instanceof Error ? error.message : 'Unable to restore your session.';
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'initializing',
  user: null,
  restoreError: null,

  restoreSession: async () => {
    if (restoreTask) return restoreTask;
    const task = (async () => {
      set({ status: 'initializing', restoreError: null });
      try {
        const tokens = await readAuthTokens();
        if (!tokens) {
          set({ status: 'unauthenticated', user: null, restoreError: null });
          return;
        }
        const user = await apiRequest<SafeUser>('/auth/me', { authenticated: true });
        set({ status: 'authenticated', user, restoreError: null });
      } catch (error) {
        if (isRecoverableRestoreError(error)) {
          set({ status: 'error', user: null, restoreError: errorMessage(error) });
          return;
        }
        await clearAuthTokens().catch(() => undefined);
        set({ status: 'unauthenticated', user: null, restoreError: null });
      }
    })();
    restoreTask = task;
    try {
      await task;
    } finally {
      if (restoreTask === task) restoreTask = null;
    }
  },

  signIn: async (input) => {
    const tokens = await apiRequest<AuthTokenPair>('/auth/login', { method: 'POST', body: input });
    await saveAuthTokens(tokens);
    set({ status: 'authenticated', user: tokens.user, restoreError: null });
    return tokens.user;
  },

  register: async (input) => {
    const tokens = await apiRequest<AuthTokenPair>('/auth/register', { method: 'POST', body: input });
    await saveAuthTokens(tokens);
    set({ status: 'authenticated', user: tokens.user, restoreError: null });
    return tokens.user;
  },

  signOut: async () => {
    let requestError: unknown;
    try {
      const tokens = await readAuthTokens();
      if (tokens?.refreshToken) {
        await apiRequest<{ loggedOut: boolean }>('/auth/logout', {
          method: 'POST',
          body: { refreshToken: tokens.refreshToken },
        });
      }
    } catch (error) {
      requestError = error;
    } finally {
      await clearAuthTokens().catch(() => undefined);
      set({ status: 'unauthenticated', user: null, restoreError: null });
    }
    if (requestError) throw requestError;
  },
}));
