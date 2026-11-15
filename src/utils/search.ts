import type { Book, ReadingStatus } from '@/types/book';

export type SearchSortKey = 'recent' | 'oldest' | 'title-asc' | 'title-desc' | 'author-asc' | 'year-desc' | 'year-asc';

export interface SearchFilters {
  genres: string[];
  authors: string[];
  publishers: string[];
  statuses: ReadingStatus[];
  wishlist: boolean;
}

export const emptySearchFilters: SearchFilters = { genres: [], authors: [], publishers: [], statuses: [], wishlist: false };

export function normalizeSearchText(value: string | undefined): string {
  return (value ?? '').trim().toLocaleLowerCase();
}

export function getPublicationYear(book: Book): number | undefined {
  if (typeof book.publishedYear === 'number' && Number.isFinite(book.publishedYear)) return book.publishedYear;
  const match = book.publicationDate?.match(/\b\d{4}\b/);
  return match ? Number(match[0]) : undefined;
}

export function matchesBookSearch(book: Book, query: string, filters: SearchFilters): boolean {
  const keyword = normalizeSearchText(query);
  const matchesQuery = !keyword || [book.title, book.author, book.publisher].some((value) => normalizeSearchText(value).includes(keyword));
  const matchesGenre = !filters.genres.length || filters.genres.some((genre) => book.shelves.includes(genre));
  const matchesAuthor = !filters.authors.length || filters.authors.some((author) => normalizeSearchText(author) === normalizeSearchText(book.author));
  const matchesPublisher = !filters.publishers.length || filters.publishers.some((publisher) => normalizeSearchText(publisher) === normalizeSearchText(book.publisher));
  const matchesStatus = !filters.statuses.length || filters.statuses.includes(book.readingStatus);
  const matchesWishlist = !filters.wishlist || book.ownership === 'wishlist';
  return matchesQuery && matchesGenre && matchesAuthor && matchesPublisher && matchesStatus && matchesWishlist;
}

export function sortSearchResults(books: Book[], sort: SearchSortKey): Book[] {
  const decorated = books.map((book, index) => ({ book, index }));
  decorated.sort((left, right) => {
    const a = left.book;
    const b = right.book;
    let result = 0;
    switch (sort) {
      case 'recent': result = normalizeSearchText(b.addedAt).localeCompare(normalizeSearchText(a.addedAt)); break;
      case 'oldest': result = normalizeSearchText(a.addedAt).localeCompare(normalizeSearchText(b.addedAt)); break;
      case 'title-asc': result = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }); break;
      case 'title-desc': result = b.title.localeCompare(a.title, undefined, { sensitivity: 'base' }); break;
      case 'author-asc': result = a.author.localeCompare(b.author, undefined, { sensitivity: 'base' }); break;
      case 'year-desc': {
        const yearA = getPublicationYear(a);
        const yearB = getPublicationYear(b);
        if (yearA === undefined) return yearB === undefined ? left.index - right.index : 1;
        if (yearB === undefined) return -1;
        result = yearB - yearA;
        break;
      }
      case 'year-asc': {
        const yearA = getPublicationYear(a);
        const yearB = getPublicationYear(b);
        if (yearA === undefined) return yearB === undefined ? left.index - right.index : 1;
        if (yearB === undefined) return -1;
        result = yearA - yearB;
        break;
      }
    }
    return result || left.index - right.index;
  });
  return decorated.map(({ book }) => book);
}
