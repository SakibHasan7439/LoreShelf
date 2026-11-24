import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, type Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_600SemiBold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { colors } from '@/theme';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAuthStore } from '@/store/auth';
import { useLibraryStore } from '@/store/library';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const authStatus = useAuthStore((state) => state.status);
  const restoreError = useAuthStore((state) => state.restoreError);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const loadLibrary = useLibraryStore((state) => state.loadLibrary);
  const clearLibrary = useLibraryStore((state) => state.clearLibrary);
  const [loaded, error] = useFonts({
    'CormorantGaramond-Regular': CormorantGaramond_400Regular,
    'CormorantGaramond-Medium': CormorantGaramond_500Medium,
    'CormorantGaramond-SemiBold': CormorantGaramond_600SemiBold,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
    'CormorantGaramond-Italic': CormorantGaramond_600SemiBold_Italic,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      void loadLibrary();
    } else {
      clearLibrary();
    }
  }, [authStatus, clearLibrary, loadLibrary]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background.base }}>
        <Text style={{ color: colors.state.danger }}>Unable to load the app fonts.</Text>
      </View>
    );
  }

  if (!loaded) {
    return null;
  }

  if (authStatus === 'initializing') {
    return <View style={styles.sessionState}><ActivityIndicator color={colors.gold[300]} /></View>;
  }

  if (authStatus === 'error') {
    return (
      <View style={styles.sessionState}>
        <AppText variant="screenTitle">Your shelves are waiting.</AppText>
        <AppText color="secondary" style={styles.restoreError}>{restoreError}</AppText>
        <PressableScale onPress={() => void restoreSession()} style={styles.retryButton} accessibilityRole="button">
          <AppText variant="button" color="inverse">Try again</AppText>
        </PressableScale>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={authStatus === 'unauthenticated'} redirectTo="/(tabs)">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={authStatus === 'authenticated'} redirectTo={'/login' as Href}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="book/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="book/edit/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="add-book" options={{ presentation: 'card' }} />
        <Stack.Screen name="search" options={{ presentation: 'card' }} />
        <Stack.Screen name="bookshelves/index" />
        <Stack.Screen name="bookshelves/[id]" />
        <Stack.Screen name="bookshelves/edit" />
        <Stack.Screen name="bookshelves/manage/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  sessionState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 28, backgroundColor: colors.background.base },
  restoreError: { maxWidth: 360, textAlign: 'center' },
  retryButton: { minWidth: 150, minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: 14, backgroundColor: colors.gold[300] },
});
