import type { ReactNode } from 'react';
import { Pressable, type PressableProps, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  /** Layout style applied to the animated wrapper. */
  style?: StyleProp<ViewStyle>;
  /** How far the content shrinks while pressed. */
  scaleTo?: number;
}

/** Adds tactile scale feedback to any card, row or control. */
export function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={(event) => {
          // Reanimated shared values are intentionally mutated by the animation API.
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withTiming(scaleTo, { duration: 110 });
          // eslint-disable-next-line react-hooks/immutability
          opacity.value = withTiming(0.9, { duration: 110 });
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          // eslint-disable-next-line react-hooks/immutability
          scale.value = withSpring(1, { damping: 20, stiffness: 260, mass: 0.6 });
          // eslint-disable-next-line react-hooks/immutability
          opacity.value = withTiming(1, { duration: 140 });
          onPressOut?.(event);
        }}
        style={styles.pressable}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
});
