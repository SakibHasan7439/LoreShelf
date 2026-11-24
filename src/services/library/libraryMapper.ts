import type { Book, BookPriority, CoverTheme, DiscoverySource, Ownership, ReadingStatus } from '@/types/book';
import type {
  BookPriority as ApiBookPriority,
  BookSource as ApiBookSource,
  CoverTheme as ApiCoverTheme,
  DiscoverySource as ApiDiscoverySource,
  LibraryEntry,
  Ownership as ApiOwnership,
  ReadingStatus as ApiReadingStatus,
} from '@/types/api';
import { getCoverTheme } from '@/utils/cover';

const ownershipFromApi: Record<ApiOwnership, Ownership> = { WISHLIST: 'wishlist', OWNED: 'owned' };
const statusFromApi: Record<ApiReadingStatus, ReadingStatus> = {
  WANT_TO_READ: 'want-to-read', READING: 'reading', COMPLETED: 'completed', ON_HOLD: 'on-hold',
};
const discoveryFromApi: Record<ApiDiscoverySource, DiscoverySource> = {
  FACEBOOK: 'facebook', INSTAGRAM: 'instagram', YOUTUBE: 'youtube', FRIEND: 'friend', OTHER: 'other',
};
const priorityFromApi: Record<ApiBookPriority, BookPriority> = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
const themeFromApi: Record<ApiCoverTheme, CoverTheme> = {
  EMERALD: 'emerald', MIDNIGHT: 'midnight', WINE: 'wine', PLUM: 'plum', CHARCOAL: 'charcoal', OCHRE: 'ochre',
};
const sourceFromApi: Record<ApiBookSource, Book['source']> = {
  GOOGLE_BOOKS: 'google-books', OPEN_LIBRARY: 'open-library', MANUAL: 'manual', ROKOMARI: 'manual', WAFILIFE: 'manual',
};

function dateOnly(value: string | null): string | undefined {
  return value?.slice(0, 10) || undefined;
}

export function mapLibraryEntry(entry: LibraryEntry): Book {
  const { book } = entry;
  const source = sourceFromApi[book.source];
  const providerSource = source === 'google-books' || source === 'open-library' ? source : undefined;
  const theme = entry.coverTheme ? themeFromApi[entry.coverTheme] : getCoverTheme(book.title);
  const purchasePrice = entry.purchasePrice === null ? undefined : Number(entry.purchasePrice);

  return {
    id: entry.id,
    userBookId: entry.id,
    bookId: entry.bookId,
    title: book.title,
    author: book.authors.map(({ author }) => author.name).join(', ') || 'Unknown author',
    description: book.description ?? undefined,
    source,
    coverUrl: entry.customCoverUri ?? book.coverUrl ?? undefined,
    customCoverUri: entry.customCoverUri ?? undefined,
    isCustom: source === 'manual',
    coverSource: entry.customCoverUri ? 'custom' : providerSource,
    coverTheme: theme,
    publisher: book.publisher ?? undefined,
    genre: book.genre ?? undefined,
    isbn: book.isbn13 ?? book.isbn10 ?? undefined,
    publicationDate: book.publishedDate ?? undefined,
    publishedYear: book.publishedYear ?? undefined,
    pageCount: book.pageCount ?? undefined,
    currentPage: entry.currentPage ?? undefined,
    discoverySource: entry.discoverySource ? discoveryFromApi[entry.discoverySource] : undefined,
    priority: entry.priority ? priorityFromApi[entry.priority] : undefined,
    notes: entry.personalNote ?? undefined,
    addedAt: dateOnly(entry.addedAt) ?? '',
    purchaseDate: dateOnly(entry.purchaseDate),
    purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : undefined,
    readingStatus: statusFromApi[entry.readingStatus],
    ownership: ownershipFromApi[entry.ownership],
    shelves: [],
    isFavorite: entry.isFavorite,
    rating: entry.rating ?? undefined,
    finishedAt: dateOnly(entry.finishedAt),
  };
}

export function toApiOwnership(ownership: Ownership): ApiOwnership {
  return ownership === 'owned' ? 'OWNED' : 'WISHLIST';
}

export function toApiReadingStatus(status: ReadingStatus): ApiReadingStatus {
  switch (status) {
    case 'want-to-read': return 'WANT_TO_READ';
    case 'on-hold': return 'ON_HOLD';
    case 'reading': return 'READING';
    case 'completed': return 'COMPLETED';
  }
}

export function toApiDiscoverySource(source: DiscoverySource): ApiDiscoverySource {
  return source.toUpperCase() as ApiDiscoverySource;
}

export function toApiBookPriority(priority: BookPriority): ApiBookPriority {
  return priority.toUpperCase() as ApiBookPriority;
}

export function toApiCoverTheme(theme: CoverTheme): ApiCoverTheme {
  return theme.toUpperCase() as ApiCoverTheme;
}
