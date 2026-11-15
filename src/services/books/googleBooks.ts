import type { BookSearchQuery, BookSearchResult } from './bookSearch';
import { mapGoogleBooksResponse } from './bookMapper';

const ENDPOINT = 'https://www.googleapis.com/books/v1/volumes';

export async function searchGoogleBooks(
  query: BookSearchQuery,
  options: { signal?: AbortSignal; timeoutMs: number },
): Promise<BookSearchResult[]> {
  const terms = [
    query.title?.trim() ? `intitle:${query.title.trim()}` : undefined,
    query.author?.trim() ? `inauthor:${query.author.trim()}` : undefined,
    query.publisher?.trim() ? `inpublisher:${query.publisher.trim()}` : undefined,
  ].filter((term): term is string => Boolean(term));
  const url = `${ENDPOINT}?${new URLSearchParams({ q: terms.join(' '), maxResults: '20' }).toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
  const abortFromCaller = () => controller.abort();
  options.signal?.addEventListener('abort', abortFromCaller, { once: true });
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Google Books request failed (${response.status})`);
    return mapGoogleBooksResponse(await response.json());
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}
