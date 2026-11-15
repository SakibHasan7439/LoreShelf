import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, gradients, layout } from '@/theme';
import { ScrollView } from 'react-native';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Rendered above the safe area, e.g. the floating add button. */
  floating?: ReactNode;
}

/** Shared screen shell: ambient gradient, soft gold glow and safe areas. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  contentContainerStyle,
  floating,
}: ScreenProps) {
  const content = (
    <>
      {children}
      {scroll ? <View style={styles.scrollTail} /> : null}
    </>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
      <AmbientGlow />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              padded && styles.padded,
              styles.content,
              contentContainerStyle,
            ]}>
            {content}
          </ScrollView>
        ) : (
          <View style={styles.fill}>{content}</View>
        )}
      </SafeAreaView>

      {floating}
    </View>
  );
}

function AmbientGlow() {
  return (
    <View pointerEvents="none" style={styles.glowWrapper}>
      <Svg width={440} height={400} viewBox="0 0 440 400">
        <Defs>
          <RadialGradient id="loreshelf-ambient" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={colors.gold[400]} stopOpacity={0.16} />
            <Stop offset="0.55" stopColor={colors.gold[500]} stopOpacity={0.05} />
            <Stop offset="1" stopColor={colors.gold[500]} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="440" height="400" fill="url(#loreshelf-ambient)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  safeArea: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
  },
  scrollTail: {
    height: layout.fabClearance,
  },
  glowWrapper: {
    position: 'absolute',
    top: -180,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
