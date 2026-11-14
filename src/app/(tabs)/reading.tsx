import { useMemo } from 'react';

import { BookCard } from '@/components/BookCard';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useOpenBook } from '@/hooks/useOpenBook';
import { useLibraryStore } from '@/store/library';
import { spacing } from '@/theme';
import type { ReadingStatus } from '@/types/book';

const statuses: readonly ReadingStatus[] = ['reading', 'on-hold', 'completed'];

export default function ReadingScreen() {
  const books = useLibraryStore((state) => state.books);
  const openBook = useOpenBook();
  const booksByStatus = useMemo(
    () =>
      statuses.map((status) => ({
        status,
        books: books.filter((book) => book.readingStatus === status),
      })),
    [books]
  );

  return (
    <Screen>
      <AppText variant="screenTitle" style={{ marginBottom: spacing.xs }}>Reading tracker</AppText>
      <AppText color="secondary" style={{ marginBottom: spacing.xl }}>
        Keep track of the stories in motion.
      </AppText>
      {booksByStatus.map(({ status, books: matching }) => (
        <Section key={status} title={status} books={matching} onOpen={openBook} />
      ))}
    </Screen>
  );
}

function Section({
  title,
  books,
  onOpen,
}: {
  title: string;
  books: ReturnType<typeof useLibraryStore.getState>['books'];
  onOpen: (bookId: string) => void;
}) {
  if (!books.length) {
    return null;
  }

  return (
    <>
      <SectionHeading title={title === 'on-hold' ? 'On hold' : title === 'completed' ? 'Completed' : 'Currently reading'} />
      {books.map((book) => <BookCard key={book.id} book={book} onPress={() => onOpen(book.id)} />)}
    </>
  );
}
