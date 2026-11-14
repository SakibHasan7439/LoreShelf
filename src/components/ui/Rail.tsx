import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';

import { layout, spacing } from '@/theme';

interface RailProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Edge-to-edge horizontal list for shelves and book cards. The negative margin
 * cancels the screen padding so content can scroll under the screen edge.
 */
export function Rail({ children, contentContainerStyle }: RailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      overScrollMode="never"
      style={styles.rail}
      contentContainerStyle={[styles.content, contentContainerStyle]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    marginHorizontal: -layout.screenPadding,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
  },
});
