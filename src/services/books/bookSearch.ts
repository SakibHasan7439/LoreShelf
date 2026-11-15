export interface BookSearchQuery {
  title?: string;
  author?: string;
  publisher?: string;
}

export interface BookSearchResult {
  source: 'google-books' | 'open-library';
  externalId: string;
  title: string;
  authors: string[];
  publisher?: string;
  description?: string;
  cover?: string;
  isbn?: string;
  publicationDate?: string;
  pageCount?: number;
}

export const BOOK_SEARCH_TIMEOUT_MS = 8_000;

/** Searches Google Books first and falls back to Open Library if it returns no usable results. */
export async function searchBooks(
  query: BookSearchQuery,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<BookSearchResult[]> {
  if (![query.title, query.author, query.publisher].some((value) => value?.trim())) return [];

  const { searchGoogleBooks } = await import('./googleBooks');
  const { searchOpenLibrary } = await import('./openLibrary');
  const timeoutMs = options.timeoutMs ?? BOOK_SEARCH_TIMEOUT_MS;

  let googleFailed = false;
  try {
    const googleResults = await searchGoogleBooks(query, { signal: options.signal, timeoutMs });
    if (googleResults.length > 0) return googleResults;
  } catch {
    // A provider failure should not prevent trying the independent fallback.
    googleFailed = true;
  }

  try {
    return await searchOpenLibrary(query, { signal: options.signal, timeoutMs });
  } catch (error) {
    if (googleFailed) throw error;
    return [];
  }
}
