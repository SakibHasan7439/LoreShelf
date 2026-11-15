import { create } from 'zustand';

import { sampleBooks } from '@/data/books';
import { shelves as defaultShelves } from '@/data/shelves';
import type { Book, NewBookInput, ReadingStatus } from '@/types/book';
import type { Shelf } from '@/types/shelf';
import { getCoverTheme } from '@/utils/cover';
import { todayIso } from '@/utils/date';

interface LibraryState {
  books: Book[];
  shelves: Shelf[];
  /** True while the preview library is shown. Toggling it resets samples. */
  isSampleLibrary: boolean;
  addBook: (input: NewBookInput) => void;
  setReadingStatus: (bookId: string, status: ReadingStatus) => void;
  setCurrentPage: (bookId: string, page: number) => void;
  updateNotes: (bookId: string, notes: string) => void;
  updateBook: (bookId: string, updates: Partial<Pick<Book, 'title' | 'author' | 'publisher' | 'description' | 'isbn' | 'publicationDate' | 'publishedYear' | 'pageCount'>>) => void;
  removeBook: (bookId: string) => void;
  moveToCollection: (bookId: string) => void;
  toggleFavorite: (bookId: string) => void;
  createShelf: (shelf: Omit<Shelf, 'id'>) => boolean;
  updateShelf: (shelfId: string, updates: Omit<Shelf, 'id'>) => boolean;
  deleteShelf: (shelfId: string) => void;
  toggleBookOnShelf: (bookId: string, shelfId: string) => void;
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
  shelves: defaultShelves.map((shelf) => ({ ...shelf })),
  isSampleLibrary: true,

  addBook: (input) => {
    const book: Book = {
      id: createBookId(input.title),
      title: input.title.trim(),
      author: input.author.trim(),
      description: input.description?.trim() || undefined,
      source: input.source ?? input.providerSource ?? 'manual',
      coverUrl: input.customCoverUri ?? input.coverUrl,
      customCoverUri: input.customCoverUri,
      isCustom: input.isCustom ?? !input.externalId,
      coverSource: input.customCoverUri
        ? 'custom'
        : input.coverSource ?? input.providerSource,
      coverTheme: getCoverTheme(input.title),
      publisher: input.publisher?.trim() || undefined,
      edition: input.edition?.trim() || undefined,
      isbn: input.isbn?.trim() || undefined,
      publicationDate: input.publicationDate?.trim() || undefined,
      externalId: input.externalId,
      providerSource: input.providerSource ?? (
        input.source === 'google-books' || input.source === 'open-library' ? input.source : undefined
      ),
      pageCount: input.pageCount,
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

  setCurrentPage: (bookId, page) => {
    set((state) => ({
      books: state.books.map((book) => {
        if (book.id !== bookId || book.pageCount === undefined || !Number.isFinite(page)) return book;
        return { ...book, currentPage: Math.max(0, Math.min(book.pageCount, Math.floor(page))) };
      }),
    }));
  },

  updateNotes: (bookId, notes) => {
    set((state) => ({
      books: state.books.map((book) => book.id === bookId ? { ...book, notes: notes.trim() || undefined } : book),
    }));
  },

  updateBook: (bookId, updates) => {
    set((state) => ({
      books: state.books.map((book) => {
        if (book.id !== bookId) return book;
        const hasPageCount = Object.prototype.hasOwnProperty.call(updates, 'pageCount');
        const normalized = { ...updates };
        if ('title' in updates) normalized.title = updates.title?.trim() ?? book.title;
        if ('author' in updates) normalized.author = updates.author?.trim() ?? book.author;
        if ('publisher' in updates) normalized.publisher = updates.publisher?.trim() || undefined;
        if ('description' in updates) normalized.description = updates.description?.trim() || undefined;
        if ('isbn' in updates) normalized.isbn = updates.isbn?.trim() || undefined;
        if ('publicationDate' in updates) normalized.publicationDate = updates.publicationDate?.trim() || undefined;
        const currentPage = updates.pageCount === undefined
          ? undefined
          : Math.max(0, Math.min(updates.pageCount, book.currentPage ?? 0));
        return {
          ...book,
          ...normalized,
          ...(hasPageCount ? { currentPage } : {}),
        };
      }),
    }));
  },

  removeBook: (bookId) => {
    set((state) => ({ books: state.books.filter((book) => book.id !== bookId) }));
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

  createShelf: (shelf) => {
    let created = false;
    set((state) => {
      if (state.shelves.some((item) => item.name.trim().toLocaleLowerCase() === shelf.name.trim().toLocaleLowerCase())) {
        return state;
      }
      const baseId = shelf.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32) || 'shelf';
      const id = `${baseId}-${Date.now().toString(36)}`;
      created = true;
      return { shelves: [...state.shelves, { ...shelf, id, name: shelf.name.trim(), tagline: shelf.tagline.trim(), isCustom: true }] };
    });
    return created;
  },

  updateShelf: (shelfId, updates) => {
    let updated = false;
    set((state) => {
      if (state.shelves.some((shelf) => shelf.id !== shelfId && shelf.name.trim().toLocaleLowerCase() === updates.name.trim().toLocaleLowerCase())) {
        return state;
      }
      updated = true;
      return { shelves: state.shelves.map((shelf) => shelf.id === shelfId ? { ...shelf, ...updates, id: shelfId, name: updates.name.trim(), tagline: updates.tagline.trim() } : shelf) };
    });
    return updated;
  },

  deleteShelf: (shelfId) => {
    if (shelfId === 'favorites') return;
    set((state) => ({
      shelves: state.shelves.filter((shelf) => shelf.id !== shelfId),
      books: state.books.map((book) => ({ ...book, shelves: book.shelves.filter((id) => id !== shelfId) })),
    }));
  },

  toggleBookOnShelf: (bookId, shelfId) => {
    set((state) => ({
      books: state.books.map((book) => {
        if (book.id !== bookId || book.ownership !== 'owned') return book;
        if (shelfId === 'favorites') return { ...book, isFavorite: !book.isFavorite };
        return {
          ...book,
          shelves: book.shelves.includes(shelfId)
            ? book.shelves.filter((id) => id !== shelfId)
            : [...book.shelves, shelfId],
        };
      }),
    }));
  },

  setSampleLibrary: (enabled) => {
    set({
      isSampleLibrary: enabled,
      books: enabled ? sampleBooks.map((book) => ({ ...book })) : [],
      shelves: defaultShelves.map((shelf) => ({ ...shelf })),
    });
  },
}));
