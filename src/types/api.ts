export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  path?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type IsoDate = string;
export type IsoDateTime = string;

export interface SafeUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  createdAt: IsoDateTime;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: 600;
  user: SafeUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  /** Backend requires 12–128 characters. */
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export type LogoutRequest = RefreshRequest;

export type BookSource = 'GOOGLE_BOOKS' | 'OPEN_LIBRARY' | 'ROKOMARI' | 'WAFILIFE' | 'MANUAL';
export type Ownership = 'WISHLIST' | 'OWNED';
export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED' | 'ON_HOLD';
export type DiscoverySource = 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE' | 'FRIEND' | 'OTHER';
export type BookPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type CoverTheme = 'EMERALD' | 'MIDNIGHT' | 'WINE' | 'PLUM' | 'CHARCOAL' | 'OCHRE';
export type BookSearchSource = 'google-books' | 'open-library';

export interface AuthorRecord {
  id: string;
  name: string;
}

export interface BookAuthorRecord {
  position: number;
  author: AuthorRecord;
}

/** Catalog row shape used by manual creation and import responses. */
export interface CatalogBook {
  id: string;
  title: string;
  description: string | null;
  genre?: string | null;
  publisher: string | null;
  isbn10: string | null;
  isbn13: string | null;
  coverUrl: string | null;
  publishedDate: string | null;
  publishedYear: number | null;
  pageCount: number | null;
  language: string | null;
  edition: string | null;
  source: BookSource;
  externalId: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  authors: BookAuthorRecord[];
}

export interface BookSearchResult {
  source: BookSearchSource;
  externalId: string;
  title: string;
  authors: string[];
  publisher: string | null;
  description: string | null;
  coverUrl: string | null;
  isbn10: string | null;
  isbn13: string | null;
  publishedDate: string | null;
  publishedYear: number | null;
  pageCount: number | null;
  language: string | null;
  edition: string | null;
}

export interface BookSearchRequest {
  q: string;
  author?: string;
  publisher?: string;
  language?: string;
  page?: number;
  limit?: number;
}

export type ProviderStatus = 'success' | 'empty' | 'failed' | 'not_attempted' | 'not_configured';

export interface BookSearchResponse {
  results: BookSearchResult[];
  pagination: { page: number; limit: number; total: number | null };
  providers: { googleBooks: ProviderStatus; openLibrary: ProviderStatus };
}

export interface ImportBookRequest {
  source: BookSearchSource;
  externalId: string;
}

export interface ManualBookRequest {
  title: string;
  authors: string[];
  publisher?: string | null;
  genre?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  edition?: string | null;
  language?: string | null;
  publishedYear?: number | null;
}

export interface CreateLibraryEntryRequest {
  bookId: string;
  ownership: Ownership;
}

export interface LibraryEntry {
  id: string;
  bookId: string;
  ownership: Ownership;
  readingStatus: ReadingStatus;
  personalNote: string | null;
  isFavorite: boolean;
  rating: number | null;
  currentPage: number | null;
  addedAt: IsoDateTime;
  purchaseDate: IsoDate | null;
  purchasePrice: string | number | null;
  finishedAt: IsoDate | null;
  discoverySource: DiscoverySource | null;
  priority: BookPriority | null;
  customCoverUri: string | null;
  coverTheme: CoverTheme | null;
  updatedAt: IsoDateTime;
  progressPercentage: number | null;
  book: Pick<CatalogBook,
    'id' | 'title' | 'description' | 'genre' | 'publisher' | 'isbn10' | 'isbn13' | 'coverUrl' |
    'publishedDate' | 'publishedYear' | 'pageCount' | 'language' | 'edition' | 'source'
  > & { authors: BookAuthorRecord[] };
}

export interface LibraryListRequest {
  ownership?: Ownership;
  readingStatus?: ReadingStatus;
  q?: string;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number };
}

export interface UpdateLibraryEntryRequest {
  ownership?: Ownership;
  readingStatus?: ReadingStatus;
  personalNote?: string | null;
  isFavorite?: boolean;
  rating?: number | null;
  currentPage?: number | null;
  purchaseDate?: IsoDate | null;
  purchasePrice?: number | string | null;
  finishedAt?: IsoDate | null;
  discoverySource?: DiscoverySource | null;
  priority?: BookPriority | null;
  customCoverUri?: string | null;
  coverTheme?: CoverTheme | null;
}

export interface ShelfRecord {
  id: string;
  name: string;
  normalizedName: string;
  tagline: string | null;
  description: string | null;
  theme: unknown | null;
  icon: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface ShelfWithBooks extends ShelfRecord {
  books: {
    createdAt: IsoDateTime;
    userBook: Pick<LibraryEntry, 'id' | 'ownership' | 'readingStatus'> & {
      book: Pick<CatalogBook, 'id' | 'title' | 'coverUrl'> & { authors: BookAuthorRecord[] };
    };
  }[];
}

export interface CreateShelfRequest {
  name: string;
  tagline?: string | null;
  description?: string | null;
  theme?: unknown | null;
  icon?: string | null;
}

export type UpdateShelfRequest = Partial<CreateShelfRequest>;

export interface ReadingStats {
  counts: Record<ReadingStatus, number>;
  total: number;
}
