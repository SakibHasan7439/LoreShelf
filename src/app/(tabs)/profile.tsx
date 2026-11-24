import { Alert, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { profile } from '@/data/profile';
import { useLibraryStats } from '@/hooks/useLibraryStats';
import { useAuthStore } from '@/store/auth';
import { colors, radius, spacing } from '@/theme';

export default function ProfileScreen() {
  const stats = useLibraryStats();
  const signOut = useAuthStore((state) => state.signOut);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      Alert.alert('Signed out on this device', 'We could not contact the server to revoke this session. Your saved sign-in has been cleared from this device.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Screen>
      <View style={styles.avatar}>
        <AppText variant="display" color="gold">{profile.initials}</AppText>
      </View>
      <AppText variant="screenTitle">{profile.name}</AppText>
      <AppText color="gold" variant="meta">{profile.title}</AppText>
      <AppText color="secondary" style={styles.bio}>{profile.bio}</AppText>

      <View style={styles.stats}>
        <AppText variant="bodyLarge">{stats.total} books owned</AppText>
        <AppText variant="bodyLarge">{stats.completed} completed</AppText>
        <AppText variant="bodyLarge">{stats.reading} in progress</AppText>
      </View>

      <PressableScale
        onPress={() => void handleSignOut()}
        disabled={signingOut}
        accessibilityRole="button"
        accessibilityState={{ disabled: signingOut, busy: signingOut }}
        style={styles.signOutAction}>
        <AppText variant="button" color="secondary">{signingOut ? 'Signing out…' : 'Sign out'}</AppText>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.line.strong,
  },
  bio: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  stats: {
    gap: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderRadius: radius.md,
    backgroundColor: colors.background.raised,
  },
  signOutAction: {
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line.soft,
  },
});
