import type { TextStyle } from 'react-native';

/**
 * Runtime font family names. Each weight is a separate static font file, so
 * never combine these families with a `fontWeight` style on Android.
 */
export const fonts = {
  serif: {
    regular: 'CormorantGaramond-Regular',
    medium: 'CormorantGaramond-Medium',
    semibold: 'CormorantGaramond-SemiBold',
    bold: 'CormorantGaramond-Bold',
    italic: 'CormorantGaramond-Italic',
  },
  sans: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
} as const;

export const typography = {
  hero: {
    fontFamily: fonts.serif.semibold,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.4,
  },
  display: {
    fontFamily: fonts.serif.semibold,
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -0.3,
  },
  screenTitle: {
    fontFamily: fonts.serif.semibold,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontFamily: fonts.serif.semibold,
    fontSize: 21,
    lineHeight: 26,
  },
  cardTitle: {
    fontFamily: fonts.serif.semibold,
    fontSize: 17,
    lineHeight: 21,
  },
  quote: {
    fontFamily: fonts.serif.italic,
    fontSize: 18,
    lineHeight: 27,
  },
  body: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  bodyLarge: {
    fontFamily: fonts.sans.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  meta: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  label: {
    fontFamily: fonts.sans.semibold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  tab: {
    fontFamily: fonts.sans.medium,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.4,
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof typography;
