export type Ownership = 'wishlist' | 'owned';

export type ReadingStatus = 'want-to-read' | 'reading' | 'completed' | 'on-hold';

export type DiscoverySource = 'facebook' | 'instagram' | 'youtube' | 'friend' | 'other';

export type BookPriority = 'high' | 'medium' | 'low';

export type ShelfId = 'fantasy' | 'fiction' | 'history' | 'philosophy' | 'science' | 'favorites';

/** Palettes used to compose a bespoke cover when no artwork is available. */
export type CoverTheme = 'emerald' | 'midnight' | 'wine' | 'plum' | 'charcoal' | 'ochre';

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  coverTheme: CoverTheme;
  publisher?: string;
  edition?: string;
  publishedYear?: number;
  pageCount?: number;
  currentPage?: number;
  discoverySource?: DiscoverySource;
  priority?: BookPriority;
  notes?: string;
  addedAt: string;
  purchaseDate?: string;
  purchasePrice?: number;
  readingStatus: ReadingStatus;
  ownership: Ownership;
  shelves: ShelfId[];
  isFavorite: boolean;
  finishedAt?: string;
}

/** Fields accepted by the quick-add flow. Everything else is derived. */
export interface NewBookInput {
  title: string;
  author: string;
  ownership: Ownership;
  notes?: string;
  discoverySource?: DiscoverySource;
  priority?: BookPriority;
  publisher?: string;
  edition?: string;
  purchasePrice?: number;
}
