import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, spacing } from '@/theme';

interface LibraryFeedbackProps {
  loading?: boolean;
  message?: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function LibraryFeedback({
  loading = false,
  message,
  onRetry,
  onDismiss,
}: LibraryFeedbackProps) {
  if (loading) {
    return (
      <View style={styles.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.gold[300]} />
        <AppText variant="caption" color="secondary">Loading your library…</AppText>
      </View>
    );
  }

  if (!message) return null;

  return (
    <View style={styles.error} accessibilityRole="alert">
      <AppText variant="caption" color="danger" style={styles.message}>{message}</AppText>
      {onRetry ? (
        <PressableScale onPress={onRetry} style={styles.action} accessibilityRole="button">
          <AppText variant="meta" color="gold">Try again</AppText>
        </PressableScale>
      ) : null}
      {onDismiss ? (
        <PressableScale onPress={onDismiss} style={styles.action} accessibilityRole="button">
          <AppText variant="meta" color="gold">Dismiss</AppText>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line.soft,
    backgroundColor: colors.background.raised,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.state.danger,
    backgroundColor: colors.background.raised,
  },
  message: { flex: 1, minWidth: 180 },
  action: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
});
