import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, gradients, layout, radius, spacing } from '@/theme';

/**
 * Global "Add a Book" action, rendered once above the bottom tab bar.
 * Hides itself while the keyboard is open so it never covers form fields.
 */
export function FloatingAddButton() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const visibility = useSharedValue(1);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return undefined;
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showListener = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideListener = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    visibility.value = withTiming(
      isKeyboardVisible ? 0 : 1,
      reduceMotion ? { duration: 0 } : { duration: 180 },
    );
  }, [isKeyboardVisible, reduceMotion, visibility]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
    transform: [{ translateY: (1 - visibility.value) * 18 }],
  }));

  return (
    <Animated.View
      pointerEvents={isKeyboardVisible ? 'none' : 'auto'}
      entering={FadeInDown.duration(reduceMotion ? 0 : 320).delay(140)}
      style={[
        styles.container,
        animatedStyle,
        { bottom: layout.tabBarBaseHeight + insets.bottom + layout.fabGap },
      ]}>
      <PressableScale
        onPress={() => router.push('/add-book')}
        accessibilityRole="button"
        accessibilityLabel="Add a Book"
        scaleTo={0.94}>
        <LinearGradient colors={gradients.fabBlue} style={styles.button} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
          <Plus size={17} color={colors.text.primary} strokeWidth={2.4} />
          <AppText variant="button" color="primary">
            Add a Book
          </AppText>
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: layout.screenPadding,
    alignItems: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    shadowColor: colors.background.deep,
    shadowOpacity: 0.42,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
