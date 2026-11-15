import { useCallback } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, spacing } from '@/theme';

interface SectionHeadingProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  /** Extra style applied to the outer container (e.g. top margin between form sections). */
  style?: StyleProp<ViewStyle>;
}

export function SectionHeading({ title, actionLabel, onActionPress, style }: SectionHeadingProps) {
  const handlePress = useCallback(() => onActionPress?.(), [onActionPress]);

  return (
    <View style={[styles.container, style]}>
      <AppText variant="sectionTitle">{title}</AppText>

      {actionLabel && onActionPress ? (
        <PressableScale
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={styles.action}
          scaleTo={0.94}>
          <View style={styles.actionInner}>
            <AppText variant="meta" color="gold">
              {actionLabel}
            </AppText>
            <ChevronRight size={14} color={colors.gold[400]} strokeWidth={1.8} />
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  action: {
    flexShrink: 0,
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
  },
});
