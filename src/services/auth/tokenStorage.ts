import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { AuthTokenPair } from '@/types/api';

const AUTH_TOKENS_KEY = 'loreshelf.auth.tokens.v1';
let webTokens: AuthTokenPair | null = null;

function isAuthTokenPair(value: unknown): value is AuthTokenPair {
  if (value === null || typeof value !== 'object') return false;
  const tokens = value as Partial<AuthTokenPair>;
  return typeof tokens.accessToken === 'string' && typeof tokens.refreshToken === 'string';
}

export async function readAuthTokens(): Promise<AuthTokenPair | null> {
  if (Platform.OS === 'web') return webTokens;
  const stored = await SecureStore.getItemAsync(AUTH_TOKENS_KEY);
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    return isAuthTokenPair(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveAuthTokens(tokens: AuthTokenPair): Promise<void> {
  if (Platform.OS === 'web') {
    webTokens = tokens;
    return;
  }
  await SecureStore.setItemAsync(AUTH_TOKENS_KEY, JSON.stringify(tokens));
}

export async function clearAuthTokens(): Promise<void> {
  if (Platform.OS === 'web') {
    webTokens = null;
    return;
  }
  await SecureStore.deleteItemAsync(AUTH_TOKENS_KEY);
}
