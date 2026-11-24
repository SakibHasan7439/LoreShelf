import { useMemo } from 'react';

import { BookCard } from '@/components/BookCard';
import { LibraryFeedback } from '@/components/library/LibraryFeedback';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useOpenBook } from '@/hooks/useOpenBook';
import { useLibraryStore } from '@/store/library';
import { spacing } from '@/theme';

export default function WishlistScreen() {
  const books = useLibraryStore((state) => state.books);
  const isLoading = useLibraryStore((state) => state.isLoading);
  const hasLoaded = useLibraryStore((state) => state.hasLoaded);
  const error = useLibraryStore((state) => state.error);
  const loadLibrary = useLibraryStore((state) => state.loadLibrary);
  const dismissError = useLibraryStore((state) => state.dismissError);
  const openBook = useOpenBook();
  const wishlist = useMemo(() => books.filter((book) => book.ownership === 'wishlist'), [books]);

  return (
    <Screen>
      <AppText variant="screenTitle" style={{ marginBottom: spacing.xs }}>Wishlist</AppText>
      <AppText color="secondary" style={{ marginBottom: spacing.xl }}>
        Books waiting for their place on your shelves.
      </AppText>
      {!hasLoaded ? (
        <LibraryFeedback
          loading={isLoading || !error}
          message={error}
          onRetry={error ? () => { void loadLibrary(); } : undefined}
        />
      ) : (
        <>
          {error ? <LibraryFeedback message={error} onDismiss={dismissError} /> : null}
          {wishlist.length ? wishlist.map((book) => (
            <BookCard key={book.id} book={book} onPress={() => openBook(book.id)} />
          )) : <AppText color="muted">Your wishlist is empty.</AppText>}
        </>
      )}
    </Screen>
  );
}
