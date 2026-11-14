import type { Book, ShelfId } from '@/types/book';

/** Reading completion between 0 and 1. Completed books are always full. */
export function getReadingProgress(book: Book): number {
  if (book.readingStatus === 'completed') {
    return 1;
  }
  if (!book.currentPage || !book.pageCount) {
    return 0;
  }
  return Math.min(1, Math.max(0, book.currentPage / book.pageCount));
}

/** Favourites are a virtual shelf derived from the `isFavorite` flag. */
export function isBookOnShelf(book: Book, shelfId: ShelfId): boolean {
  return shelfId === 'favorites' ? book.isFavorite : book.shelves.includes(shelfId);
}

export function countBooksOnShelf(books: readonly Book[], shelfId: ShelfId): number {
  return books.filter((book) => isBookOnShelf(book, shelfId)).length;
}

export function sortByAddedAtDesc(books: readonly Book[]): Book[] {
  return [...books].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}
