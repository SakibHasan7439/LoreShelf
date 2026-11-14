import { create } from 'zustand';

import { sampleBooks } from '@/data/books';
import type { Book, NewBookInput, ReadingStatus } from '@/types/book';
import { getCoverTheme } from '@/utils/cover';
import { todayIso } from '@/utils/date';

interface LibraryState {
  books: Book[];
  /** True while the preview library is shown. Toggling it resets samples. */
  isSampleLibrary: boolean;
  addBook: (input: NewBookInput) => void;
  setReadingStatus: (bookId: string, status: ReadingStatus) => void;
  moveToCollection: (bookId: string) => void;
  toggleFavorite: (bookId: string) => void;
  setSampleLibrary: (enabled: boolean) => void;
}

function createBookId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  return `${slug || 'book'}-${Date.now().toString(36)}`;
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  // Sample objects are copied so preview sessions never mutate the source data.
  books: sampleBooks.map((book) => ({ ...book })),
  isSampleLibrary: true,

  addBook: (input) => {
    const book: Book = {
      id: createBookId(input.title),
      title: input.title.trim(),
      author: input.author.trim(),
      description: undefined,
      coverTheme: getCoverTheme(input.title),
      publisher: input.publisher?.trim() || undefined,
      edition: input.edition?.trim() || undefined,
      discoverySource: input.discoverySource,
      priority: input.priority,
      notes: input.notes?.trim() || undefined,
      addedAt: todayIso(),
      purchaseDate: input.ownership === 'owned' ? todayIso() : undefined,
      purchasePrice: input.purchasePrice,
      readingStatus: 'want-to-read',
      ownership: input.ownership,
      shelves: [],
      isFavorite: false,
    };

    set((state) => ({ books: [book, ...state.books] }));
  },

  setReadingStatus: (bookId, status) => {
    set((state) => ({
      books: state.books.map((book) => {
        if (book.id !== bookId) {
          return book;
        }
        if (status === 'completed') {
          return {
            ...book,
            readingStatus: status,
            currentPage: book.pageCount ?? book.currentPage,
            finishedAt: todayIso(),
          };
        }
        return { ...book, readingStatus: status, finishedAt: undefined };
      }),
    }));
  },

  moveToCollection: (bookId) => {
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId
          ? { ...book, ownership: 'owned', purchaseDate: todayIso() }
          : book
      ),
    }));
  },

  toggleFavorite: (bookId) => {
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book
      ),
    }));
  },

  setSampleLibrary: (enabled) => {
    set({
      isSampleLibrary: enabled,
      books: enabled ? sampleBooks.map((book) => ({ ...book })) : [],
    });
  },
}));
