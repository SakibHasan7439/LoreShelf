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

export default function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  async function submit() {
    Keyboard.dismiss();
    const emailValue = email.trim();
    const nextErrors: typeof fieldErrors = {};
    if (!/^\S+@\S+\.\S+$/u.test(emailValue) || emailValue.length > 320) nextErrors.email = 'Enter a valid email address.';
    if (!password || password.length > 128) nextErrors.password = 'Enter your password.';
    setFieldErrors(nextErrors);
    setError(null);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await signIn({ email: emailValue, password });
    } catch (cause) {
      setError(getAuthErrorMessage(cause, 'Unable to sign in. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="YOUR READING LIFE, KEPT"
      title="Welcome back."
      subtitle="Step back into your shelves, notes and the stories you have been carrying."
      footer={(
        <View style={styles.footerRow}>
          <AppText color="secondary">New to LoreShelf?</AppText>
          <PressableScale onPress={() => router.push('/register' as Href)} style={styles.footerAction}>
            <AppText variant="button" color="gold">Create an account</AppText>
          </PressableScale>
        </View>
      )}>
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
        placeholder="Your password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={() => void submit()}
        error={fieldErrors.password}
      />
      {error ? <View style={styles.errorBox}><AppText color="danger" accessibilityRole="alert">{error}</AppText></View> : null}
      <AuthSubmitButton label="Sign in" busyLabel="Signing in" loading={loading} onPress={() => void submit()} />
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  footerAction: { padding: spacing.xs },
  errorBox: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.state.danger, backgroundColor: 'rgba(208,139,122,0.08)' },
});
