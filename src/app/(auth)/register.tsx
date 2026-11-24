import { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { AuthField } from '@/components/auth/AuthField';
import { AuthFrame } from '@/components/auth/AuthFrame';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAuthStore } from '@/store/auth';
import { colors, radius, spacing } from '@/theme';
import { getAuthErrorMessage } from '@/utils/authError';

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  async function submit() {
    Keyboard.dismiss();
    const nameValue = name.trim();
    const emailValue = email.trim();
    const nextErrors: typeof fieldErrors = {};
    if (!nameValue || nameValue.length > 120) nextErrors.name = 'Enter a name up to 120 characters.';
    if (!/^\S+@\S+\.\S+$/u.test(emailValue) || emailValue.length > 320) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 12 || password.length > 128) nextErrors.password = 'Use a password between 12 and 128 characters.';
    if (confirmPassword !== password) nextErrors.confirmPassword = 'The passwords do not match.';
    setFieldErrors(nextErrors);
    setError(null);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await register({ name: nameValue, email: emailValue, password });
    } catch (cause) {
      setError(getAuthErrorMessage(cause, 'Unable to create your account. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="A PLACE FOR EVERY STORY"
      title="Make room for more."
      subtitle="Create your account and begin keeping the books, ideas and small reading rituals that matter to you."
      footer={(
        <View style={styles.footerRow}>
          <AppText color="secondary">Already have an account?</AppText>
          <PressableScale onPress={() => router.push('/login' as Href)} style={styles.footerAction}>
            <AppText variant="button" color="gold">Sign in</AppText>
          </PressableScale>
        </View>
      )}>
      <AuthField
        label="Your name"
        value={name}
        onChangeText={setName}
        placeholder="How should we address you?"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        error={fieldErrors.name}
      />
      <AuthField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        error={fieldErrors.email}
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 12 characters"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        error={fieldErrors.password}
      />
      <AuthField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Enter your password again"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={() => void submit()}
        error={fieldErrors.confirmPassword}
      />
      {error ? <View style={styles.errorBox}><AppText color="danger" accessibilityRole="alert">{error}</AppText></View> : null}
      <AuthSubmitButton label="Create account" busyLabel="Creating account" loading={loading} onPress={() => void submit()} />
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  footerAction: { padding: spacing.xs },
  errorBox: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.state.danger, backgroundColor: 'rgba(208,139,122,0.08)' },
});
