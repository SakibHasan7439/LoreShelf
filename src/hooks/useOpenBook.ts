import { router } from 'expo-router';
import { useCallback } from 'react';

/** Single place that knows how book detail routes are addressed. */
export function useOpenBook() {
  return useCallback((bookId: string) => {
    router.push({ pathname: '/book/[id]', params: { id: bookId } });
  }, []);
}
