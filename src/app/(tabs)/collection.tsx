import { router } from 'expo-router';
import { BookMarked, Search } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BookCard } from '@/components/BookCard';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { useOpenBook } from '@/hooks/useOpenBook';
import { useLibraryStore } from '@/store/library';
import { colors, radius, spacing } from '@/theme';
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
      <PressableScale onPress={() => router.push('/search')} style={styles.shelvesLink} accessibilityRole="button" accessibilityLabel="Search books">
        <View style={styles.shelvesIcon}><Search size={18} color={colors.gold[300]} /></View>
        <View style={styles.shelvesCopy}><AppText variant="meta">Search your library</AppText><AppText variant="caption" color="muted">Find a title, author, publisher or genre</AppText></View>
        <AppText variant="meta" color="gold">Search</AppText>
      </PressableScale>
      <PressableScale onPress={() => router.push('/bookshelves')} style={styles.shelvesLink} accessibilityRole="button" accessibilityLabel="Open my bookshelves">
        <View style={styles.shelvesIcon}><BookMarked size={18} color={colors.gold[300]} /></View>
        <View style={styles.shelvesCopy}><AppText variant="meta">My bookshelves</AppText><AppText variant="caption" color="muted">Arrange your collection into personal shelves</AppText></View>
        <AppText variant="meta" color="gold">Open</AppText>
      </PressableScale>
      {collection.length ? collection.map((book) => (
        <BookCard key={book.id} book={book} onPress={() => openBook(book.id)} />
      )) : <AppText color="muted">Your collection is empty.</AppText>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  shelvesLink: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised },
  shelvesIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: 'rgba(198,166,107,0.1)' },
  shelvesCopy: { flex: 1, gap: 2 },
});
