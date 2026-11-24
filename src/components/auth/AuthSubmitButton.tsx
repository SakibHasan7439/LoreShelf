import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, spacing } from '@/theme';

interface AuthSubmitButtonProps {
  label: string;
  busyLabel: string;
  loading: boolean;
  onPress: () => void;
}

export function AuthSubmitButton({ label, busyLabel, loading, onPress }: AuthSubmitButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      style={styles.button}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={colors.text.inverse} /> : <AppText variant="button" color="inverse">{label}</AppText>}
        {loading ? <AppText variant="button" color="inverse">{busyLabel}</AppText> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.gold[300],
  },
  content: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
