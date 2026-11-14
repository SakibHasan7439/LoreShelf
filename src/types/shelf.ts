import type { ShelfId } from './book';

export type ShelfGlyph = 'castle' | 'feather' | 'landmark' | 'scroll' | 'flask' | 'star';

export interface Shelf {
  id: ShelfId;
  name: string;
  tagline: string;
  glyph: ShelfGlyph;
  /** Muted, low-contrast gradient used by the shelf card surface. */
  tint: readonly [string, string];
}

export interface LibraryProfile {
  name: string;
  initials: string;
  title: string;
  bio: string;
}
