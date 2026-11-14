import { Text, type TextProps } from 'react-native';

import { textColors, type TextColor, typography, type TextVariant } from '@/theme';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
}

/** Typography-aware Text primitive. Do not use raw font styles in screens. */
export function AppText({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: AppTextProps) {
  return <Text {...rest} style={[typography[variant], { color: textColors[color] }, style]} />;
}
