export type Ownership = 'wishlist' | 'owned';

export type ReadingStatus = 'want-to-read' | 'reading' | 'completed' | 'on-hold';

export type DiscoverySource = 'facebook' | 'instagram' | 'youtube' | 'friend' | 'other';

export type BookPriority = 'high' | 'medium' | 'low';

/** Shelf identifiers include built-in and user-created shelves. */
export type ShelfId = string;

/** Palettes used to compose a bespoke cover when no artwork is available. */
export type CoverTheme = 'emerald' | 'midnight' | 'wine' | 'plum' | 'charcoal' | 'ochre';

export type BookSource = 'manual' | 'google-books' | 'open-library';
export type BookCoverSource = 'custom' | 'google-books' | 'open-library';

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  /** Search provider that supplied this edition, or manual for user-created entries. */
  source?: BookSource;
  coverUrl?: string;
  /** Local user-selected cover. Kept separately from provider artwork. */
  customCoverUri?: string;
  isCustom?: boolean;
  coverSource?: BookCoverSource;
  coverTheme: CoverTheme;
  publisher?: string;
  isbn?: string;
  publicationDate?: string;
  externalId?: string;
  providerSource?: 'google-books' | 'open-library';
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
  description?: string;
  source?: BookSource;
  coverUrl?: string;
  customCoverUri?: string;
  isCustom?: boolean;
  coverSource?: BookCoverSource;
  isbn?: string;
  publicationDate?: string;
  externalId?: string;
  providerSource?: 'google-books' | 'open-library';
  pageCount?: number;
  purchasePrice?: number;
}
