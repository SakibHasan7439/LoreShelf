import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { profile } from '@/data/profile';
import { useLibraryStats } from '@/hooks/useLibraryStats';
import { useLibraryStore } from '@/store/library';
import { colors, radius, spacing } from '@/theme';

export default function ProfileScreen() {
  const stats = useLibraryStats();
  const isSampleLibrary = useLibraryStore((state) => state.isSampleLibrary);
  const setSampleLibrary = useLibraryStore((state) => state.setSampleLibrary);

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
        onPress={() => setSampleLibrary(!isSampleLibrary)}
        accessibilityRole="button"
        style={styles.action}>
        <AppText variant="button" color="gold">
          {isSampleLibrary ? 'Preview empty library' : 'Restore sample library'}
        </AppText>
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
  action: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.background.elevated,
  },
});
