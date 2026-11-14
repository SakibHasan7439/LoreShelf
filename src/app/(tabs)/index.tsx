import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BookCard } from '@/components/BookCard';
import { AppText } from '@/components/ui/AppText';
import { Rail } from '@/components/ui/Rail';
import { Screen } from '@/components/ui/Screen';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { shelves } from '@/data/shelves';
import { useLibraryStats } from '@/hooks/useLibraryStats';
import { useOpenBook } from '@/hooks/useOpenBook';
import { useLibraryStore } from '@/store/library';
import { colors, radius, spacing } from '@/theme';
import { countBooksOnShelf, sortByAddedAtDesc } from '@/utils/book';
import { getGreeting } from '@/utils/date';

export default function HomeScreen() {
  const books = useLibraryStore((state) => state.books);
  const stats = useLibraryStats();
  const openBook = useOpenBook();
  const recent = useMemo(() => sortByAddedAtDesc(books).slice(0, 5), [books]);
  const reading = books.filter((book) => book.readingStatus === 'reading');

  return (
    <Screen>
      <AppText variant="label" color="gold">
        {getGreeting()}
      </AppText>
      <AppText variant="hero" style={styles.title}>
        Your shelves,
        {'\n'}your stories.
      </AppText>
      <View style={styles.stats}>
        <Stat label="Collection" value={stats.total} />
        <Stat label="Wishlist" value={stats.wishlist} />
        <Stat label="Finished" value={stats.completed} />
      </View>

      <SectionHeading title="Reading now" />
      {reading.length ? (
        reading.map((book) => <BookCard key={book.id} book={book} onPress={() => openBook(book.id)} />)
      ) : (
        <EmptyText text="Nothing is in progress yet." />
      )}

      <SectionHeading title="Your shelves" />
      <Rail>
        {shelves.map((shelf) => (
          <View key={shelf.id} style={styles.shelf}>
            <AppText variant="cardTitle">{shelf.name}</AppText>
            <AppText variant="caption" color="secondary">
              {countBooksOnShelf(books, shelf.id)} books
            </AppText>
          </View>
        ))}
      </Rail>

      <SectionHeading title="Recently added" />
      {recent.map((book) => <BookCard key={book.id} book={book} onPress={() => openBook(book.id)} />)}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <AppText variant="display" color="gold">
        {value}
      </AppText>
      <AppText variant="caption" color="secondary">
        {label}
      </AppText>
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  return <AppText color="muted" style={styles.empty}>{text}</AppText>;
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  stat: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background.raised,
  },
  shelf: {
    width: 132,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background.raised,
    borderWidth: 1,
    borderColor: colors.line.hairline,
  },
  empty: {
    marginBottom: spacing.xl,
  },
});
