import { create } from 'zustand';

import { shelves as defaultShelves } from '@/data/shelves';
import { apiRequest } from '@/services/api/client';
import { deleteLibraryEntry, createLibraryEntry, listPersonalLibrary, updateLibraryEntry } from '@/services/library/personalLibrary';
import { mapLibraryEntry, toApiReadingStatus } from '@/services/library/libraryMapper';
import type { Book, NewBookInput, ReadingStatus } from '@/types/book';
import type { LibraryEntry, UpdateLibraryEntryRequest } from '@/types/api';
import type { Shelf } from '@/types/shelf';
import { todayIso } from '@/utils/date';

interface LibraryState {
  books: Book[];
  shelves: Shelf[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  loadLibrary: () => Promise<boolean>;
  clearLibrary: () => void;
  dismissError: () => void;
  addBook: (input: NewBookInput) => Promise<Book | null>;
  addCatalogBook: (catalogBookId: string, ownership: Book['ownership']) => Promise<Book | null>;
  setReadingStatus: (bookId: string, status: ReadingStatus) => Promise<boolean>;
  setCurrentPage: (bookId: string, page: number) => Promise<boolean>;
  updateNotes: (bookId: string, notes: string) => Promise<boolean>;
  removeBook: (bookId: string) => Promise<boolean>;
  moveToCollection: (bookId: string) => Promise<boolean>;
  toggleFavorite: (bookId: string) => Promise<boolean>;
  createShelf: (shelf: Omit<Shelf, 'id'>) => boolean;
  updateShelf: (shelfId: string, updates: Omit<Shelf, 'id'>) => boolean;
  deleteShelf: (shelfId: string) => void;
  toggleBookOnShelf: (bookId: string, shelfId: string) => void;
}

let loadTask: Promise<boolean> | null = null;
let libraryGeneration = 0;
const mutationQueues = new Map<string, Promise<boolean>>();

function userBookId(book: Book): string {
  return book.userBookId ?? book.id;
}

function requestError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export const useLibraryStore = create<LibraryState>()((set, get) => {
  async function mutateEntry(
    id: string,
    operation: () => Promise<LibraryEntry | { removed: boolean }>,
  ): Promise<boolean> {
    const previous = mutationQueues.get(id) ?? Promise.resolve(true);
    const task = previous.catch(() => false).then(async () => {
      try {
        const result = await operation();
        if ('removed' in result) {
          set((state) => ({ books: state.books.filter((book) => userBookId(book) !== id), error: null }));
        } else {
          const updated = mapLibraryEntry(result);
          set((state) => ({
            books: state.books.map((book) => userBookId(book) === id ? updated : book),
            error: null,
          }));
        }
        return true;
      } catch (error) {
        set({ error: requestError(error, 'Your library could not be updated. Please try again.') });
        return false;
      }
    });
    mutationQueues.set(id, task);
    try {
      return await task;
    } finally {
      if (mutationQueues.get(id) === task) mutationQueues.delete(id);
    }
  }

  async function patchEntry(id: string, body: UpdateLibraryEntryRequest): Promise<boolean> {
    return mutateEntry(id, () => updateLibraryEntry(id, body));
  }

  return {
    books: [],
    shelves: defaultShelves.map((shelf) => ({ ...shelf })),
    isLoading: false,
    hasLoaded: false,
    error: null,

    loadLibrary: async () => {
      if (loadTask) return loadTask;
      const requestGeneration = libraryGeneration;
      set({ isLoading: true, error: null });
      const task = (async () => {
        try {
          const entries = await listPersonalLibrary();
          if (requestGeneration !== libraryGeneration) return false;
          const books = entries.map(mapLibraryEntry);
          set({ books, isLoading: false, hasLoaded: true, error: null });
          return true;
        } catch (error) {
          if (requestGeneration === libraryGeneration) {
            set({ isLoading: false, error: requestError(error, 'Your library could not be loaded. Please try again.') });
          }
          return false;
        }
      })();
      loadTask = task;
      try {
        return await task;
      } finally {
        if (loadTask === task) loadTask = null;
      }
    },

    clearLibrary: () => {
      libraryGeneration += 1;
      loadTask = null;
      mutationQueues.clear();
      set({ books: [], isLoading: false, hasLoaded: false, error: null });
    },

    dismissError: () => set({ error: null }),

    addBook: async (input) => {
      try {
        const result = await createLibraryEntry(input);
        let book = mapLibraryEntry(result.entry);
        if (input.customCoverUri) {
          book = { ...book, coverUrl: input.customCoverUri, customCoverUri: input.customCoverUri, coverSource: 'custom' };
        }
        set((state) => ({ books: [book, ...state.books.filter((item) => userBookId(item) !== book.userBookId)] }));
        set({ error: result.enrichmentError ? requestError(result.enrichmentError, 'The book was added, but some personal details did not save.') : null });
        return book;
      } catch (error) {
        set({ error: requestError(error, 'Your book could not be added. Please try again.') });
        return null;
      }
    },

    addCatalogBook: async (catalogBookId, ownership) => {
      try {
        const entry = await apiRequest<LibraryEntry>('/library', {
          method: 'POST', authenticated: true, body: { bookId: catalogBookId, ownership: ownership === 'owned' ? 'OWNED' : 'WISHLIST' },
        });
        const book = mapLibraryEntry(entry);
        set((state) => ({ books: [book, ...state.books.filter((item) => userBookId(item) !== entry.id)], error: null }));
        return book;
      } catch (error) {
        set({ error: requestError(error, 'This catalog book could not be added to your library.') });
        return null;
      }
    },

    setReadingStatus: async (bookId, status) => {
      const id = get().books.find((book) => book.id === bookId)?.userBookId ?? bookId;
      const book = get().books.find((item) => userBookId(item) === id);
      const body: UpdateLibraryEntryRequest = { readingStatus: toApiReadingStatus(status) };
      if (status === 'completed' && book?.pageCount !== undefined) body.currentPage = book.pageCount;
      return patchEntry(id, body);
    },

    setCurrentPage: async (bookId, page) => {
      const book = get().books.find((item) => item.id === bookId);
      if (!book || book.pageCount === undefined || !Number.isFinite(page)) return false;
      const currentPage = Math.max(0, Math.min(book.pageCount, Math.floor(page)));
      return patchEntry(userBookId(book), { currentPage });
    },

    updateNotes: async (bookId, notes) => {
      const book = get().books.find((item) => item.id === bookId);
      return patchEntry(book ? userBookId(book) : bookId, { personalNote: notes.trim() || null });
    },

    removeBook: async (bookId) => {
      const book = get().books.find((item) => item.id === bookId);
      const id = book ? userBookId(book) : bookId;
      return mutateEntry(id, () => deleteLibraryEntry(id));
    },

    moveToCollection: async (bookId) => {
      const book = get().books.find((item) => item.id === bookId);
      const id = book ? userBookId(book) : bookId;
      return patchEntry(id, { ownership: 'OWNED', purchaseDate: todayIso() });
    },

    toggleFavorite: async (bookId) => {
      const book = get().books.find((item) => item.id === bookId);
      if (!book) return false;
      return patchEntry(userBookId(book), { isFavorite: !book.isFavorite });
    },

    createShelf: (shelf) => {
      let created = false;
      set((state) => {
        if (state.shelves.some((item) => item.name.trim().toLocaleLowerCase() === shelf.name.trim().toLocaleLowerCase())) return state;
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
        if (state.shelves.some((shelf) => shelf.id !== shelfId && shelf.name.trim().toLocaleLowerCase() === updates.name.trim().toLocaleLowerCase())) return state;
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
  };
});
