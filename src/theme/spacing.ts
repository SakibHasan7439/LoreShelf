/** Spacing scale in density-independent pixels (4pt rhythm). */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

/** Corner radius scale. Covers use the smallest values, cards the mid ones. */
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const layout = {
  /** Horizontal breathing room used by every screen. */
  screenPadding: 20,
  /** Keeps content readable on tablets and foldables. */
  maxContentWidth: 560,
  tabBarBaseHeight: 58,
  fabSize: 56,
} as const;
