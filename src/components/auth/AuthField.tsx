import { StyleSheet, TextInput, View, type KeyboardTypeOptions, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';

interface AuthFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
}

export function AuthField({ label, error, ...inputProps }: AuthFieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color="secondary">{label}</AppText>
      <TextInput
        {...inputProps}
        placeholderTextColor={colors.text.muted}
        selectionColor={colors.gold[300]}
        style={[styles.input, error ? styles.inputError : null]}
        accessibilityLabel={label}
      />
      {error ? <AppText variant="caption" color="danger" accessibilityRole="alert">{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line.soft,
    backgroundColor: colors.background.raised,
    color: colors.text.primary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  inputError: {
    borderColor: colors.state.danger,
  },
});
