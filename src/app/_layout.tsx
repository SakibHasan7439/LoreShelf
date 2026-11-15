import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="add-book" options={{ presentation: 'card' }} />
    </Stack>
  );
}
