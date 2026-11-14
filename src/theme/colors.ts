/**
 * LoreShelf colour system — a dark-academia palette built around warm gold,
 * deep emerald and ink-dark backgrounds. Keep all colour decisions here so
 * screens and components stay token-driven.
 */
export const colors = {
  background: {
    deep: '#090C0A',
    base: '#0E120F',
    raised: '#141A15',
    surface: '#171E18',
    elevated: '#1F2721',
    overlay: '#273229',
  },
  gold: {
    100: '#F6EAD1',
    200: '#E9D3A6',
    300: '#D8BC85',
    400: '#C6A66B',
    500: '#AE8B52',
    600: '#8C6E3F',
  },
  emerald: {
    200: '#8FB39C',
    300: '#5F8B70',
    400: '#456B53',
    500: '#355B46',
    600: '#274434',
  },
  text: {
    primary: '#F2EBDD',
    secondary: '#B8B1A3',
    muted: '#918B7D',
    inverse: '#12170F',
  },
  line: {
    hairline: 'rgba(226, 197, 141, 0.10)',
    soft: 'rgba(226, 197, 141, 0.18)',
    strong: 'rgba(226, 197, 141, 0.34)',
  },
  state: {
    success: '#8FB39C',
    warning: '#D9B36C',
    danger: '#D08B7A',
  },
  scrim: 'rgba(7, 10, 8, 0.72)',
  transparent: 'transparent',
  white: '#FFFFFF',
} as const;

/** Semantic text colours exposed by the `AppText` component. */
export const textColors = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  muted: colors.text.muted,
  gold: colors.gold[400],
  goldSoft: colors.gold[200],
  emerald: colors.emerald[200],
  inverse: colors.text.inverse,
  danger: colors.state.danger,
} as const;

export type TextColor = keyof typeof textColors;
