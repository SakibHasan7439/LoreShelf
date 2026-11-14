import { useMemo } from 'react';

import { BookCard } from '@/components/BookCard';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useOpenBook } from '@/hooks/useOpenBook';
import { useLibraryStore } from '@/store/library';
import { spacing } from '@/theme';
import { sortByAddedAtDesc } from '@/utils/book';

export default function CollectionScreen() {
  const books = useLibraryStore((state) => state.books);
  const openBook = useOpenBook();
  const collection = useMemo(
    () => sortByAddedAtDesc(books.filter((book) => book.ownership === 'owned')),
    [books]
  );

  return (
    <Screen>
      <AppText variant="screenTitle" style={{ marginBottom: spacing.xs }}>My collection</AppText>
      <AppText color="secondary" style={{ marginBottom: spacing.xl }}>
        The books already living with you.
      </AppText>
      {collection.length ? collection.map((book) => (
        <BookCard key={book.id} book={book} onPress={() => openBook(book.id)} />
      )) : <AppText color="muted">Your collection is empty.</AppText>}
    </Screen>
  );
}
