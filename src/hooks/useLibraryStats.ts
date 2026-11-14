import { useMemo } from 'react';

import { useLibraryStore } from '@/store/library';

export interface LibraryStats {
  total: number;
  wishlist: number;
  completed: number;
  reading: number;
}

export function useLibraryStats(): LibraryStats {
  const books = useLibraryStore((state) => state.books);

  return useMemo(
    () => ({
      total: books.filter((book) => book.ownership === 'owned').length,
      wishlist: books.filter((book) => book.ownership === 'wishlist').length,
      completed: books.filter((book) => book.readingStatus === 'completed').length,
      reading: books.filter((book) => book.readingStatus === 'reading').length,
    }),
    [books]
  );
}
