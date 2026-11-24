import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/theme';

interface AuthFrameProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthFrame({ eyebrow, title, subtitle, children, footer }: AuthFrameProps) {
  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.brandMark}>
        <BookOpen size={22} color={colors.gold[300]} strokeWidth={1.6} />
      </View>
      <AppText variant="label" color="gold">{eyebrow}</AppText>
      <AppText variant="hero" style={styles.title}>{title}</AppText>
      <AppText color="secondary" style={styles.subtitle}>{subtitle}</AppText>
      <View style={styles.form}>{children}</View>
      <View style={styles.footer}>{footer}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  brandMark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line.strong,
    backgroundColor: colors.background.raised,
  },
  title: {
    marginTop: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 380,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
});
