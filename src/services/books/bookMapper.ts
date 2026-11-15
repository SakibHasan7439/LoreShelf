import type { BookSearchResult } from './bookSearch';

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : undefined;
}

function string(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(string).filter((item): item is string => Boolean(item)) : [];
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
}

function firstString(value: unknown): string | undefined {
  return strings(value)[0];
}

export function mapGoogleBooksResponse(payload: unknown): BookSearchResult[] {
  const items = record(payload)?.items;
  if (!Array.isArray(items)) return [];

  return items.flatMap((raw): BookSearchResult[] => {
    const item = record(raw);
    const info = record(item?.volumeInfo);
    const externalId = string(item?.id);
    const title = string(info?.title);
    if (!externalId || !title) return [];

    const identifiers = Array.isArray(info?.industryIdentifiers) ? info.industryIdentifiers : [];
    const isbnEntry = identifiers.map(record).find((entry) =>
      (entry?.type === 'ISBN_13' || entry?.type === 'ISBN_10') && string(entry?.identifier),
    );
    const images = record(info?.imageLinks);
    const cover = string(images?.thumbnail) ?? string(images?.smallThumbnail);

    return [{
      source: 'google-books',
      externalId,
      title,
      authors: strings(info?.authors),
      publisher: string(info?.publisher),
      description: string(info?.description),
      cover: cover?.replace(/^http:/, 'https:'),
      isbn: string(isbnEntry?.identifier),
      publicationDate: string(info?.publishedDate),
      pageCount: positiveInteger(info?.pageCount),
    }];
  });
}

export function mapOpenLibraryResponse(payload: unknown): BookSearchResult[] {
  const docs = record(payload)?.docs;
  if (!Array.isArray(docs)) return [];

  return docs.flatMap((raw): BookSearchResult[] => {
    const doc = record(raw);
    const title = string(doc?.title);
    const externalId = string(doc?.key);
    if (!externalId || !title) return [];

    const coverId = positiveInteger(doc?.cover_i);
    const firstSentence = doc?.first_sentence;
    const description = string(firstSentence) ?? firstString(firstSentence);
    return [{
      source: 'open-library',
      externalId,
      title,
      authors: strings(doc?.author_name),
      publisher: firstString(doc?.publisher),
      description,
      cover: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
      isbn: firstString(doc?.isbn),
      publicationDate: firstString(doc?.publish_date) ?? (
        typeof doc?.first_publish_year === 'number' ? String(doc.first_publish_year) : undefined
      ),
      pageCount: positiveInteger(doc?.number_of_pages_median),
    }];
  });
}
