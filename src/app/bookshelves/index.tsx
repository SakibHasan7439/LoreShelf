import { router } from 'expo-router';
import { ArrowRight, Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BookCover } from '@/components/BookCover';
import { ShelfMark } from '@/components/shelves/ShelfMark';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/theme';
import { useLibraryStore } from '@/store/library';
import { countBooksOnShelf, isBookOnShelf } from '@/utils/book';

export default function BookshelvesScreen() {
  const shelves = useLibraryStore((state) => state.shelves);
  const books = useLibraryStore((state) => state.books);
  const owned = useMemo(() => books.filter((book) => book.ownership === 'owned'), [books]);

  return <Screen>
    <View style={styles.header}>
      <View><AppText variant="label" color="gold">YOUR PERSONAL LIBRARY</AppText><AppText variant="screenTitle" style={styles.title}>Bookshelves</AppText><AppText variant="body" color="secondary">A place for every kind of story.</AppText></View>
      <PressableScale onPress={() => router.push('/bookshelves/edit')} style={styles.addButton} accessibilityRole="button" accessibilityLabel="Create new shelf"><Plus size={21} color={colors.text.inverse} /></PressableScale>
    </View>
    <View style={styles.shelfList}>
      {shelves.map((shelf) => {
        const shelfBooks = owned.filter((book) => isBookOnShelf(book, shelf.id));
        return <PressableScale key={shelf.id} onPress={() => router.push({ pathname: '/bookshelves/[id]', params: { id: shelf.id } })} style={styles.card} accessibilityRole="button" accessibilityLabel={`Open ${shelf.name} shelf`}>
          <LinearGradient colors={[...shelf.tint]} style={StyleSheet.absoluteFill} />
          <View style={styles.cardTop}><ShelfMark shelf={shelf} /><ArrowRight size={17} color={colors.gold[300]} /></View>
          <View style={styles.preview}>
            {shelfBooks.slice(0, 3).map((book, index) => <View key={book.id} style={[styles.peek, { left: index * 36, zIndex: 4 - index }]}><BookCover book={book} width={48} height={70} /></View>)}
            {shelfBooks.length === 0 && <View style={styles.emptyPeek}><AppText variant="label" color="goldSoft">A QUIET SHELF</AppText></View>}
            <View style={styles.bookCount}><AppText variant="meta" color="goldSoft">{countBooksOnShelf(owned, shelf.id)} {countBooksOnShelf(owned, shelf.id) === 1 ? 'book' : 'books'}</AppText></View>
          </View>
          <View style={styles.plank} />
          <View style={styles.cardBottom}><View style={styles.nameWrap}><AppText variant="sectionTitle" numberOfLines={1}>{shelf.name}</AppText><AppText variant="caption" color="secondary" numberOfLines={1}>{shelf.description || shelf.tagline}</AppText></View><ShelfMark shelf={shelf} size={15} /></View>
        </PressableScale>;
      })}
      {!shelves.length && <View style={styles.noShelves}><AppText variant="sectionTitle">Start your collection of stories</AppText><AppText variant="body" color="secondary">Create a shelf for the books you love.</AppText></View>}
    </View>
    <PressableScale onPress={() => router.push('/bookshelves/edit')} style={styles.createRow} accessibilityRole="button" accessibilityLabel="Create a new bookshelf"><View style={styles.createIcon}><Plus size={17} color={colors.gold[300]} /></View><View style={styles.createCopy}><AppText variant="meta">Create a new shelf</AppText><AppText variant="caption" color="muted">Make a little room for a new collection</AppText></View><ArrowRight size={16} color={colors.gold[500]} /></PressableScale>
  </Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs, marginBottom: spacing.xxl },
  title: { marginTop: spacing.xs, marginBottom: spacing.xxs },
  addButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.gold[400] },
  shelfList: { gap: spacing.md },
  card: { minHeight: 188, overflow: 'hidden', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.soft },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preview: { height: 76, marginTop: spacing.sm, position: 'relative', flexDirection: 'row', alignItems: 'flex-end' },
  peek: { position: 'absolute', bottom: 0, borderRadius: radius.xs, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(242,235,221,0.28)' },
  emptyPeek: { height: 61, width: 146, justifyContent: 'center', alignItems: 'center', borderRadius: radius.xs, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line.strong },
  bookCount: { position: 'absolute', right: 0, bottom: 4, paddingVertical: 5, paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: 'rgba(9,12,10,0.68)' },
  plank: { height: 5, marginTop: spacing.xs, borderRadius: radius.xs, backgroundColor: 'rgba(198,166,107,0.48)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.28, shadowRadius: 4, elevation: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  nameWrap: { flex: 1, marginRight: spacing.sm },
  noShelves: { padding: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  createRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line.strong, backgroundColor: 'rgba(20,26,21,0.72)' },
  createIcon: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: radius.sm, backgroundColor: 'rgba(198,166,107,0.12)' },
  createCopy: { flex: 1, gap: 2 },
});
