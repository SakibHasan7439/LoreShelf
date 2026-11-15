import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/theme';
import { useLibraryStore } from '@/store/library';
import { isBookOnShelf, sortByAddedAtDesc } from '@/utils/book';

export default function ManageShelfBooksScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shelf = useLibraryStore((state) => state.shelves.find((item) => item.id === id));
  const books = useLibraryStore((state) => state.books);
  const toggleBookOnShelf = useLibraryStore((state) => state.toggleBookOnShelf);
  const collection = useMemo(() => sortByAddedAtDesc(books.filter((book) => book.ownership === 'owned')), [books]);

  if (!shelf) return <Screen><AppText variant="screenTitle">Shelf not found</AppText></Screen>;

  return <Screen>
    <PressableScale onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to shelf"><ArrowLeft size={18} color={colors.gold[300]} /><AppText variant="meta" color="gold">Back to {shelf.name}</AppText></PressableScale>
    <AppText variant="screenTitle" style={styles.title}>Choose your books</AppText>
    <AppText variant="body" color="secondary" style={styles.subtitle}>Add or remove books from “{shelf.name}”. Your collection stays just as it is.</AppText>
    {collection.length ? <View style={styles.list}>{collection.map((book) => {
      const selected = isBookOnShelf(book, shelf.id);
      return <PressableScale key={book.id} onPress={() => toggleBookOnShelf(book.id, shelf.id)} style={styles.row} accessibilityRole="button" accessibilityLabel={`${selected ? 'Remove' : 'Add'} ${book.title} ${selected ? 'from' : 'to'} ${shelf.name}`} accessibilityState={{ selected }}>
        <BookCover book={book} width={48} height={70} />
        <View style={styles.bookDetails}><AppText variant="cardTitle" numberOfLines={2}>{book.title}</AppText><AppText variant="caption" color="secondary" numberOfLines={1}>{book.author}</AppText><AppText variant="caption" color={selected ? 'emerald' : 'muted'}>{selected ? 'On this shelf' : 'In your collection'}</AppText></View>
        <View style={[styles.selectIcon, selected && styles.selectedIcon]}>{selected ? <Check size={17} color={colors.text.inverse} /> : <Plus size={17} color={colors.gold[300]} />}</View>
      </PressableScale>;
    })}</View> : <View style={styles.empty}><AppText variant="sectionTitle">Your collection is empty</AppText><AppText variant="body" color="secondary" style={styles.emptyText}>Add books to your collection first, then you can arrange them on this shelf.</AppText></View>}
    <PressableScale onPress={() => router.back()} style={styles.done} accessibilityRole="button" accessibilityLabel="Done managing books"><AppText variant="button" color="inverse">Done</AppText></PressableScale>
  </Screen>;
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.lg },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.xl },
  list: { gap: spacing.sm },
  row: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  bookDetails: { flex: 1, gap: 2 },
  selectIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.soft },
  selectedIcon: { backgroundColor: colors.emerald[300], borderColor: colors.emerald[300] },
  empty: { padding: spacing.xxl, alignItems: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  emptyText: { textAlign: 'center', marginTop: spacing.sm },
  done: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, borderRadius: radius.md, backgroundColor: colors.gold[400] },
});
