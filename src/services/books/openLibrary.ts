import type { BookSearchQuery, BookSearchResult } from './bookSearch';
import { mapOpenLibraryResponse } from './bookMapper';

const ENDPOINT = 'https://openlibrary.org/search.json';
const FIELDS = 'key,title,author_name,publisher,isbn,first_publish_year,publish_date,number_of_pages_median,cover_i,first_sentence';

export async function searchOpenLibrary(
  query: BookSearchQuery,
  options: { signal?: AbortSignal; timeoutMs: number },
): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    fields: FIELDS,
    limit: '20',
  });
  if (query.title?.trim()) params.set('title', query.title.trim());
  if (query.author?.trim()) params.set('author', query.author.trim());
  if (query.publisher?.trim()) params.set('publisher', query.publisher.trim());

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
  const abortFromCaller = () => controller.abort();
  options.signal?.addEventListener('abort', abortFromCaller, { once: true });
  try {
    const response = await fetch(`${ENDPOINT}?${params.toString()}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Open Library request failed (${response.status})`);
    return mapOpenLibraryResponse(await response.json());
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}
