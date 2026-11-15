import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { ShelfMark } from '@/components/shelves/ShelfMark';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { useOpenBook } from '@/hooks/useOpenBook';
import { useLibraryStore } from '@/store/library';
import { colors, radius, spacing } from '@/theme';
import { isBookOnShelf } from '@/utils/book';

export default function ShelfDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shelf = useLibraryStore((state) => state.shelves.find((item) => item.id === id));
  const books = useLibraryStore((state) => state.books);
  const deleteShelf = useLibraryStore((state) => state.deleteShelf);
  const shelfBooks = useMemo(() => books.filter((book) => book.ownership === 'owned' && isBookOnShelf(book, id)), [books, id]);
  const openBook = useOpenBook();

  if (!shelf) return <Screen><PressableScale onPress={() => router.back()} style={styles.back}><ArrowLeft size={18} color={colors.gold[300]} /><AppText variant="meta" color="gold">Back to bookshelves</AppText></PressableScale><AppText variant="screenTitle" style={styles.notFound}>This shelf has wandered off.</AppText></Screen>;

  const confirmDelete = () => Alert.alert('Remove this shelf?', `“${shelf.name}” will be removed. The books themselves will stay in your collection.`, [
    { text: 'Keep shelf', style: 'cancel' },
    { text: 'Remove shelf', style: 'destructive', onPress: () => { deleteShelf(shelf.id); router.back(); } },
  ]);

  return <Screen>
    <View style={styles.topBar}><PressableScale onPress={() => router.back()} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Back"><ArrowLeft size={19} color={colors.text.primary} /></PressableScale><View style={styles.topActions}><PressableScale onPress={() => router.push({ pathname: '/bookshelves/edit', params: { id: shelf.id } })} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Edit shelf"><Pencil size={17} color={colors.gold[300]} /></PressableScale>{shelf.id !== 'favorites' ? <PressableScale onPress={confirmDelete} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Delete shelf"><Trash2 size={17} color={colors.state.danger} /></PressableScale> : null}</View></View>
    <View style={[styles.hero, { borderColor: `${shelf.tint[0]}CC` }]}><View style={[StyleSheet.absoluteFill, { backgroundColor: shelf.tint[1] }]} /><View style={styles.heroRow}><ShelfMark shelf={shelf} size={23} /><AppText variant="meta" color="gold">A SHELF IN YOUR LIBRARY</AppText></View><AppText variant="hero" style={styles.shelfName}>{shelf.name}</AppText><AppText variant="body" color="secondary">{shelf.description || shelf.tagline}</AppText><View style={styles.heroFoot}><View style={styles.heroRule} /><AppText variant="caption" color="goldSoft">{shelfBooks.length} {shelfBooks.length === 1 ? 'book' : 'books'} gathered here</AppText></View></View>

    <View style={styles.sectionTitle}><AppText variant="sectionTitle">On this shelf</AppText><AppText variant="caption" color="muted">{shelfBooks.length} titles</AppText></View>
    {shelfBooks.length ? <View style={styles.grid}>{shelfBooks.map((book) => <PressableScale key={book.id} onPress={() => openBook(book.id)} style={styles.bookTile} accessibilityRole="button" accessibilityLabel={`Open ${book.title}`}><BookCover book={book} width={112} height={162} /><AppText variant="meta" numberOfLines={2} style={styles.bookTitle}>{book.title}</AppText><AppText variant="caption" color="muted" numberOfLines={1}>{book.author}</AppText></PressableScale>)}</View> : <View style={styles.empty}><View style={styles.emptyIcon}><MoreHorizontal size={20} color={colors.gold[300]} /></View><AppText variant="cardTitle">This shelf is ready for a story</AppText><AppText variant="caption" color="secondary" style={styles.emptyBody}>Bring together books from your collection to make this shelf your own.</AppText><PressableScale onPress={() => router.push({ pathname: '/bookshelves/manage/[id]', params: { id: shelf.id } })} style={styles.addButton} accessibilityRole="button" accessibilityLabel="Add books to shelf"><View style={styles.addButtonInner}><BookPlus size={17} color={colors.text.inverse} /><AppText variant="button" color="inverse">Add books</AppText></View></PressableScale></View>}
    {shelfBooks.length ? <PressableScale onPress={() => router.push({ pathname: '/bookshelves/manage/[id]', params: { id: shelf.id } })} style={styles.manageButton} accessibilityRole="button" accessibilityLabel="Add or remove books"><BookPlus size={17} color={colors.gold[300]} /><AppText variant="meta" color="gold">Add or remove books</AppText></PressableScale> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs, marginBottom: spacing.lg },
  topActions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  notFound: { marginTop: spacing.xl },
  hero: { overflow: 'hidden', padding: spacing.xl, borderRadius: radius.xl, borderWidth: 1 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shelfName: { marginTop: spacing.lg, marginBottom: spacing.xs },
  heroFoot: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  heroRule: { width: 36, height: 1, backgroundColor: colors.gold[400] },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: spacing.xxl, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.lg },
  bookTile: { width: '47%', gap: spacing.xs, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  bookTitle: { minHeight: 36, lineHeight: 18, marginTop: spacing.xs },
  empty: { alignItems: 'center', padding: spacing.xxl, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  emptyIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, borderRadius: radius.pill, backgroundColor: 'rgba(198,166,107,0.12)' },
  emptyBody: { textAlign: 'center', marginTop: spacing.xs, lineHeight: 18 },
  addButton: { marginTop: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.gold[400] },
  addButtonInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  manageButton: { minHeight: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft },
});
