import type { CoverTheme } from '@/types/book';

export interface CoverPalette {
  from: string;
  to: string;
  accent: string;
  ink: string;
}

export const coverPalettes: Record<CoverTheme, CoverPalette> = {
  emerald: { from: '#21392B', to: '#0E1712', accent: '#C6A66B', ink: '#F2EBDD' },
  midnight: { from: '#1B2A38', to: '#0B1219', accent: '#D8BC85', ink: '#EDF1EE' },
  wine: { from: '#3B2229', to: '#150C10', accent: '#D8BC85', ink: '#F3E8DC' },
  plum: { from: '#2D2438', to: '#120F17', accent: '#C9B08A', ink: '#F2EBDD' },
  charcoal: { from: '#292D2B', to: '#101312', accent: '#C6A66B', ink: '#EFEAE0' },
  ochre: { from: '#3A2E1F', to: '#17110A', accent: '#E9D3A6', ink: '#F6EAD1' },
};

const themeOrder: readonly CoverTheme[] = ['emerald', 'midnight', 'wine', 'plum', 'charcoal', 'ochre'];

/** Stable, deterministic theme for books created without cover artwork. */
export function getCoverTheme(seed: string): CoverTheme {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  return themeOrder[hash % themeOrder.length];
}
