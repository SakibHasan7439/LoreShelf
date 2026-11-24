import { apiRequest } from '@/services/api/client';
import type {
  BookSearchSource,
  CatalogBook,
  CreateLibraryEntryRequest,
  ImportBookRequest,
  LibraryEntry,
  ManualBookRequest,
  Paginated,
  UpdateLibraryEntryRequest,
} from '@/types/api';
import type { NewBookInput } from '@/types/book';
import { todayIso } from '@/utils/date';
import { toApiOwnership } from './libraryMapper';

const PAGE_SIZE = 50;

async function listOwnership(ownership: 'wishlist' | 'owned'): Promise<LibraryEntry[]> {
  const apiOwnership = toApiOwnership(ownership);
  const query = new URLSearchParams({ ownership: apiOwnership, page: '1', limit: String(PAGE_SIZE) });
  const firstPage = await apiRequest<Paginated<LibraryEntry>>(`/library?${query.toString()}`, { authenticated: true });
  const items = [...firstPage.items];
  const pageCount = Math.ceil(firstPage.pagination.total / firstPage.pagination.limit);

  for (let page = 2; page <= pageCount; page += 1) {
    const nextQuery = new URLSearchParams({ ownership: apiOwnership, page: String(page), limit: String(PAGE_SIZE) });
    const next = await apiRequest<Paginated<LibraryEntry>>(`/library?${nextQuery.toString()}`, { authenticated: true });
    items.push(...next.items);
  }
  return items;
}

/** Retrieves every page from both persisted Personal Library ownership lists. */
export async function listPersonalLibrary(): Promise<LibraryEntry[]> {
  const [wishlist, collection] = await Promise.all([listOwnership('wishlist'), listOwnership('owned')]);
  return [...wishlist, ...collection];
}

async function createCatalogBook(input: NewBookInput): Promise<CatalogBook> {
  if (input.externalId && (input.providerSource === 'google-books' || input.providerSource === 'open-library')) {
    const request: ImportBookRequest = { source: input.providerSource satisfies BookSearchSource, externalId: input.externalId };
    return apiRequest<CatalogBook>('/books/import', { method: 'POST', body: request });
  }

  const normalizedIsbn = input.isbn?.replace(/[\s-]/gu, '').toUpperCase();
  const coverUrl = input.coverUrl?.match(/^https?:\/\//iu) ? input.coverUrl : undefined;
  const request: ManualBookRequest = {
    title: input.title.trim(),
    authors: input.author.split(',').map((author) => author.trim()).filter(Boolean),
    publisher: input.publisher?.trim() || null,
    description: input.description?.trim() || null,
    coverUrl: coverUrl ?? null,
    edition: input.edition?.trim() || null,
    publishedYear: input.publishedYear ?? (input.publicationDate ? Number(input.publicationDate.slice(0, 4)) || null : null),
    ...(normalizedIsbn?.length === 10 ? { isbn10: normalizedIsbn } : {}),
    ...(normalizedIsbn?.length === 13 ? { isbn13: normalizedIsbn } : {}),
  };
  return apiRequest<CatalogBook>('/books/manual', { method: 'POST', body: request });
}

export interface CreateLibraryResult {
  entry: LibraryEntry;
  enrichmentError?: unknown;
}

export async function createLibraryEntry(input: NewBookInput): Promise<CreateLibraryResult> {
  const catalogBook = await createCatalogBook(input);
  const request: CreateLibraryEntryRequest = { bookId: catalogBook.id, ownership: toApiOwnership(input.ownership) };
  let entry = await apiRequest<LibraryEntry>('/library', {
    method: 'POST',
    authenticated: true,
    body: request,
  });

  const enrichment: UpdateLibraryEntryRequest = {};
  if (input.notes !== undefined) enrichment.personalNote = input.notes.trim() || null;
  if (input.discoverySource) enrichment.discoverySource = input.discoverySource.toUpperCase() as NonNullable<UpdateLibraryEntryRequest['discoverySource']>;
  if (input.priority) enrichment.priority = input.priority.toUpperCase() as NonNullable<UpdateLibraryEntryRequest['priority']>;
  if (input.ownership === 'owned') enrichment.purchaseDate = todayIso();
  if (input.purchasePrice !== undefined) enrichment.purchasePrice = input.purchasePrice;
  if (Object.keys(enrichment).length) {
    try {
      entry = await apiRequest<LibraryEntry>(`/library/${entry.id}`, {
        method: 'PATCH',
        authenticated: true,
        body: enrichment,
      });
    } catch (enrichmentError) {
      return { entry, enrichmentError };
    }
  }
  return { entry };
}

export function updateLibraryEntry(userBookId: string, input: UpdateLibraryEntryRequest): Promise<LibraryEntry> {
  return apiRequest<LibraryEntry>(`/library/${userBookId}`, {
    method: 'PATCH', authenticated: true, body: input,
  });
}

export function deleteLibraryEntry(userBookId: string): Promise<{ removed: boolean }> {
  return apiRequest<{ removed: boolean }>(`/library/${userBookId}`, {
    method: 'DELETE', authenticated: true,
  });
}
