export type GradientStops = readonly [string, string, ...string[]];

/**
 * Shared gradients. Keeping them in one place prevents drifting colour values
 * and makes the ambient lighting of the app consistent across screens.
 */
export const gradients = {
  screen: ['#121915', '#0E120F', '#0A0D0B'] as GradientStops,
  card: ['rgba(255, 255, 255, 0.045)', 'rgba(255, 255, 255, 0.012)'] as GradientStops,
  gold: ['#E9D3A6', '#C6A66B'] as GradientStops,
  goldPressed: ['#D8BC85', '#AE8B52'] as GradientStops,
  emeraldCard: ['#1D2C23', '#131B16'] as GradientStops,
  fabBlue: ['#3F6490', '#24405E'] as GradientStops,
  coverSheen: ['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0)'] as GradientStops,
  coverShade: ['rgba(7, 10, 8, 0)', 'rgba(7, 10, 8, 0.55)'] as GradientStops,
  hairline: ['rgba(226, 197, 141, 0)', 'rgba(226, 197, 141, 0.45)', 'rgba(226, 197, 141, 0)'] as GradientStops,
  tabBar: ['#151C16', '#0C100D'] as GradientStops,
} as const;
