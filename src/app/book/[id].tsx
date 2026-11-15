import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, Check, ChevronDown, CircleCheck, Heart, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BookCover } from '@/components/BookCover';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { readingStatusMeta, readingStatusOrder } from '@/constants/library';
import { useLibraryStore } from '@/store/library';
import { colors, radius, spacing } from '@/theme';
import { formatPageCount } from '@/utils/format';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useLibraryStore((state) => state.books.find((item) => item.id === id));
  const shelves = useLibraryStore((state) => state.shelves);
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);
  const moveToCollection = useLibraryStore((state) => state.moveToCollection);
  const setReadingStatus = useLibraryStore((state) => state.setReadingStatus);
  const setCurrentPage = useLibraryStore((state) => state.setCurrentPage);
  const updateNotes = useLibraryStore((state) => state.updateNotes);
  const removeBook = useLibraryStore((state) => state.removeBook);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [pageVisible, setPageVisible] = useState(false);
  const [pageDraft, setPageDraft] = useState('');

  const genres = useMemo(() => (book?.shelves ?? [])
    .filter((shelfId) => shelfId !== 'favorites')
    .map((shelfId) => shelves.find((shelf) => shelf.id === shelfId)?.name)
    .filter((name): name is string => Boolean(name)), [book?.shelves, shelves]);

  if (!book) {
    return <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.notFound}>
        <AppText variant="screenTitle">This book could not be found.</AppText>
        <PressableScale onPress={() => router.back()} style={styles.backLink} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={17} color={colors.gold[300]} /><AppText variant="button" color="gold">Go back</AppText>
        </PressableScale>
      </View>
    </Screen>;
  }

  const progressAvailable = book.pageCount !== undefined && book.pageCount > 0;
  const progressPage = book.readingStatus === 'completed' ? book.pageCount : book.currentPage;
  const progress = progressAvailable && progressPage !== undefined ? Math.min(1, Math.max(0, progressPage / book.pageCount!)) : 0;
  const progressRecorded = book.readingStatus === 'completed' || book.currentPage !== undefined;
  const longDescription = (book.description?.length ?? 0) > 190;

  const confirmRemoval = () => Alert.alert(
    'Remove this book?',
    `“${book.title}” will be removed from your library. This cannot be undone.`,
    [
      { text: 'Keep book', style: 'cancel' },
      { text: 'Remove book', style: 'destructive', onPress: () => { removeBook(book.id); router.back(); } },
    ]
  );

  const openNotes = () => {
    setNotesDraft(book.notes ?? '');
    setNotesVisible(true);
  };

  const openPageEditor = () => {
    setPageDraft(String(book.currentPage ?? (book.readingStatus === 'completed' ? book.pageCount : 0) ?? 0));
    setPageVisible(true);
  };

  const savePage = () => {
    const page = Number(pageDraft.trim());
    if (!Number.isInteger(page) || page < 0 || page > (book.pageCount ?? 0)) {
      Alert.alert('Check the page number', `Enter a whole number from 0 to ${book.pageCount ?? 0}.`);
      return;
    }
    setCurrentPage(book.id, page);
    setPageVisible(false);
  };

  return <Screen>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.topBar}>
  <PressableScale onPress={() => router.back()} style={styles.topButton} accessibilityRole="button" accessibilityLabel="Go back">
    <View style={styles.topButtonContent}>
      <ArrowLeft size={19} color={colors.text.primary} />
    </View>
  </PressableScale>
  <AppText variant="label" color="gold" numberOfLines={1} style={styles.topBarLabel}>A BOOK IN YOUR LIBRARY</AppText>
  <PressableScale onPress={() => toggleFavorite(book.id)} style={[styles.topButton, book.isFavorite && styles.favoriteButton]} accessibilityRole="button" accessibilityLabel={book.isFavorite ? 'Remove from favourites' : 'Add to favourites'} accessibilityState={{ selected: book.isFavorite }}>
    <View style={styles.topButtonContent}>
      <Heart size={19} color={book.isFavorite ? colors.gold[200] : colors.text.secondary} fill={book.isFavorite ? colors.gold[400] : 'transparent'} />
    </View>
  </PressableScale>
</View>

    <View style={styles.hero}>
      <LinearGradient colors={[colors.background.elevated, colors.background.base, colors.background.deep]} style={StyleSheet.absoluteFill} />
      <View style={styles.heroGlow} />
      <View style={styles.coverShadow}><BookCover book={book} width={176} height={260} /></View>
      <AppText variant="hero" style={styles.title}>{book.title}</AppText>
      <AppText variant="bodyLarge" color="secondary" style={styles.author}>{book.author}</AppText>
      <View style={styles.statusBadge}><BookOpen size={13} color={colors.gold[300]} /><AppText variant="caption" color="goldSoft">{readingStatusMeta[book.readingStatus].label}</AppText></View>
    </View>

    {progressAvailable ? <View style={styles.progressCard}>
      <View style={styles.progressHeading}><View><AppText variant="label" color="gold">YOUR READING JOURNEY</AppText><AppText variant="sectionTitle" style={styles.sectionTitle}>Reading progress</AppText></View><CircleCheck size={21} color={book.readingStatus === 'completed' ? colors.emerald[200] : colors.gold[400]} /></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
      <View style={styles.progressMeta}><AppText variant="caption" color="secondary">{progressRecorded ? `${progressPage ?? 0} of ${book.pageCount} pages` : `${book.pageCount} pages · progress not recorded`}</AppText>{progressRecorded ? <AppText variant="meta" color="goldSoft">{Math.round(progress * 100)}%</AppText> : null}</View>
      {book.readingStatus !== 'completed' ? <PressableScale onPress={openPageEditor} style={styles.updatePage} accessibilityRole="button" accessibilityLabel="Update current page"><Pencil size={14} color={colors.gold[300]} /><AppText variant="meta" color="gold">Update current page</AppText></PressableScale> : null}
    </View> : null}

    <View style={styles.section}>
      <View style={styles.sectionHeader}><AppText variant="sectionTitle">The details</AppText><AppText variant="caption" color="muted">{formatPageCount(book.currentPage, book.pageCount) ?? 'From your library'}</AppText></View>
      {genres.length ? <View style={styles.genreRow}>{genres.map((genre) => <View key={genre} style={styles.genreChip}><AppText variant="caption" color="goldSoft">{genre}</AppText></View>)}</View> : null}
      <View style={styles.metadataGrid}>
        {book.publisher ? <MetadataItem label="Publisher" value={book.publisher} /> : null}
        {book.edition ? <MetadataItem label="Edition" value={book.edition} /> : null}
        {book.isbn ? <MetadataItem label="ISBN" value={book.isbn} /> : null}
        {book.publishedYear || book.publicationDate ? <MetadataItem label="Published" value={book.publishedYear ? String(book.publishedYear) : book.publicationDate!} /> : null}
        {book.pageCount ? <MetadataItem label="Length" value={`${book.pageCount} pages`} /> : null}
      </View>
      {book.description ? <View style={styles.descriptionBlock}><AppText variant="label" color="gold">ABOUT THIS BOOK</AppText><AppText variant="bodyLarge" color="secondary" numberOfLines={longDescription && !descriptionExpanded ? 5 : undefined} style={styles.description}>{book.description}</AppText>{longDescription ? <PressableScale onPress={() => setDescriptionExpanded((expanded) => !expanded)} style={styles.moreButton} accessibilityRole="button" accessibilityLabel={descriptionExpanded ? 'Show less description' : 'Show more description'}><AppText variant="meta" color="gold">{descriptionExpanded ? 'Show less' : 'Read the full description'}</AppText><ChevronDown size={15} color={colors.gold[400]} style={descriptionExpanded ? styles.chevronUp : undefined} /></PressableScale> : null}</View> : null}
    </View>

    <View style={styles.notesCard}>
      <View style={styles.notesHeading}><View><AppText variant="label" color="gold">JUST FOR YOU</AppText><AppText variant="sectionTitle" style={styles.sectionTitle}>Personal notes</AppText></View><PressableScale onPress={openNotes} style={styles.noteEdit} accessibilityRole="button" accessibilityLabel={book.notes ? 'Edit personal notes' : 'Add personal notes'}><Pencil size={15} color={colors.gold[300]} /><AppText variant="caption" color="gold">{book.notes ? 'Edit' : 'Add note'}</AppText></PressableScale></View>
      {book.notes ? <AppText variant="quote" color="secondary" style={styles.noteText}>{book.notes}</AppText> : <AppText variant="body" color="muted" style={styles.noNotes}>Keep a thought, a favorite passage, or a note for your next reread.</AppText>}
    </View>

    <View style={styles.section}>
      <AppText variant="sectionTitle" style={styles.statusTitle}>Reading status</AppText>
      <AppText variant="caption" color="muted" style={styles.statusHint}>Choose the chapter this book is in.</AppText>
      <View style={styles.statuses}>{readingStatusOrder.map((status) => {
        const selected = book.readingStatus === status;
        const StatusIcon = readingStatusMeta[status].icon;
        return <PressableScale key={status} onPress={() => setReadingStatus(book.id, status)} style={[styles.status, selected && styles.selectedStatus]} accessibilityRole="button" accessibilityState={{ selected }}>
          <View style={styles.statusContent}>
            <StatusIcon size={15} color={selected ? colors.gold[300] : colors.text.muted} />
            <AppText variant="meta" color={selected ? 'goldSoft' : 'secondary'} numberOfLines={1} ellipsizeMode="tail" style={styles.statusLabel}>{readingStatusMeta[status].label}</AppText>
            {selected ? <Check size={14} color={colors.gold[300]} /> : null}
          </View>
        </PressableScale>;
      })}</View>
    </View>

    <View style={styles.actions}>
      <PressableScale onPress={() => router.push({ pathname: '/book/edit/[id]', params: { id: book.id } })} style={styles.editAction} accessibilityRole="button" accessibilityLabel="Edit book details"><View style={styles.actionContent}><Pencil size={16} color={colors.gold[300]} /><AppText variant="meta" color="gold" numberOfLines={1}>Edit details</AppText></View></PressableScale>
      {book.ownership === 'wishlist' ? <PressableScale onPress={() => moveToCollection(book.id)} style={styles.collectionAction} accessibilityRole="button" accessibilityLabel="Move book to collection"><View style={styles.actionContent}><Plus size={17} color={colors.text.inverse} /><AppText variant="button" color="inverse" numberOfLines={1}>Move to collection</AppText></View></PressableScale> : null}
      <PressableScale onPress={confirmRemoval} style={styles.removeAction} accessibilityRole="button" accessibilityLabel="Remove book from library"><View style={styles.actionContent}><Trash2 size={16} color={colors.state.danger} /><AppText variant="meta" color="danger" numberOfLines={1}>Remove from library</AppText></View></PressableScale>
    </View>

    <Modal visible={notesVisible} transparent animationType="slide" onRequestClose={() => setNotesVisible(false)}>
      <View style={styles.modalRoot}><Pressable onPress={() => setNotesVisible(false)} style={styles.scrim} accessibilityRole="button" accessibilityLabel="Cancel note editing" /><View style={styles.modalCard}>
        <View style={styles.modalHeader}><View style={styles.modalHeaderCopy}><AppText variant="sectionTitle" numberOfLines={1}>A note for this story</AppText><AppText variant="caption" color="secondary" numberOfLines={1}>Your thoughts stay with this book.</AppText></View><PressableScale onPress={() => setNotesVisible(false)} style={styles.modalClose} accessibilityRole="button" accessibilityLabel="Close notes"><ChevronDown size={19} color={colors.text.secondary} /></PressableScale></View>
        <TextInput value={notesDraft} onChangeText={setNotesDraft} placeholder="A favorite passage, a thought, a reread note…" placeholderTextColor={colors.text.muted} multiline maxLength={1200} textAlignVertical="top" accessibilityLabel="Personal book notes" style={styles.notesInput} />
        <View style={styles.modalButtons}><PressableScale onPress={() => setNotesVisible(false)} style={styles.cancelButton} accessibilityRole="button" accessibilityLabel="Cancel note changes"><AppText variant="meta" color="secondary">Cancel</AppText></PressableScale><PressableScale onPress={() => { updateNotes(book.id, notesDraft); setNotesVisible(false); }} style={styles.saveButton} accessibilityRole="button" accessibilityLabel="Save personal notes"><AppText variant="button" color="inverse">Save note</AppText></PressableScale></View>
      </View></View>
    </Modal>

    <Modal visible={pageVisible} transparent animationType="slide" onRequestClose={() => setPageVisible(false)}>
      <View style={styles.modalRoot}><Pressable onPress={() => setPageVisible(false)} style={styles.scrim} accessibilityRole="button" accessibilityLabel="Cancel page update" /><View style={styles.modalCard}>
        <View style={styles.modalHeader}><View style={styles.modalHeaderCopy}><AppText variant="sectionTitle" numberOfLines={1}>Where did you pause?</AppText><AppText variant="caption" color="secondary" numberOfLines={1}>Enter a page from 0 to {book.pageCount}.</AppText></View><PressableScale onPress={() => setPageVisible(false)} style={styles.modalClose} accessibilityRole="button" accessibilityLabel="Close page editor"><ChevronDown size={19} color={colors.text.secondary} /></PressableScale></View>
        <View style={styles.pageInputRow}><TextInput value={pageDraft} onChangeText={setPageDraft} keyboardType="number-pad" maxLength={String(book.pageCount ?? 0).length || 1} selectTextOnFocus accessibilityLabel="Current page" style={styles.pageInput} /><AppText variant="body" color="muted">of {book.pageCount} pages</AppText></View>
        <View style={styles.modalButtons}><PressableScale onPress={() => setPageVisible(false)} style={styles.cancelButton} accessibilityRole="button" accessibilityLabel="Cancel page update"><AppText variant="meta" color="secondary">Cancel</AppText></PressableScale><PressableScale onPress={savePage} style={styles.saveButton} accessibilityRole="button" accessibilityLabel="Save current page"><AppText variant="button" color="inverse">Save progress</AppText></PressableScale></View>
      </View></View>
    </Modal>
  </Screen>;
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return <View style={styles.metadataItem}><AppText variant="label" color="muted">{label}</AppText><AppText variant="meta" numberOfLines={2} style={styles.metadataValue}>{value}</AppText></View>;
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.md },
  topBarLabel: { flex: 1, textAlign: 'center' },
  topButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  favoriteButton: { borderColor: colors.line.strong, backgroundColor: 'rgba(198,166,107,0.12)' },
  hero: { position: 'relative', alignItems: 'center', overflow: 'hidden', paddingTop: spacing.xl, paddingBottom: spacing.xl, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line.hairline },
  heroGlow: { position: 'absolute', top: 12, width: 228, height: 228, borderRadius: 114, backgroundColor: 'rgba(198,166,107,0.08)' },
  coverShadow: { borderRadius: radius.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 12 },
  title: { maxWidth: '94%', marginTop: spacing.lg, textAlign: 'center', fontSize: 34, lineHeight: 38 },
  author: { marginTop: spacing.xs, textAlign: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: 'rgba(9,12,10,0.48)' },
  progressCard: { padding: spacing.lg, marginTop: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: 'rgba(24,32,26,0.9)' },
  progressHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { marginTop: spacing.xxs },
  progressTrack: { height: 6, overflow: 'hidden', marginTop: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.background.deep },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.gold[400] },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  updatePage: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', marginTop: spacing.md, paddingVertical: spacing.xs },
  section: { marginTop: spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: spacing.sm },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  genreChip: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: 'rgba(198,166,107,0.08)' },
  metadataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metadataItem: { width: '48%', minHeight: 60, justifyContent: 'center', gap: spacing.xxs, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  metadataValue: { color: colors.text.primary },
  descriptionBlock: { marginTop: spacing.xl },
  description: { marginTop: spacing.sm, lineHeight: 24 },
  moreButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', marginTop: spacing.sm, paddingVertical: spacing.xs },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  notesCard: { marginTop: spacing.xxl, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(143,179,156,0.2)', backgroundColor: 'rgba(20,29,23,0.84)' },
  notesHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  noteEdit: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.xs },
  noteText: { marginTop: spacing.md },
  noNotes: { marginTop: spacing.md, lineHeight: 21 },
  statusTitle: { marginBottom: spacing.xxs },
  statusHint: { marginBottom: spacing.md },
  statuses: { gap: spacing.sm },
  status: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  statusContent: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusLabel: { flex: 1, minWidth: 0 },
  selectedStatus: { borderColor: colors.gold[500], backgroundColor: 'rgba(198,166,107,0.1)' },
  actions: { gap: spacing.sm, marginTop: spacing.xxl },
  actionContent: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm },
  editAction: { minHeight: 50, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised },
  collectionAction: { minHeight: 50, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.gold[400] },
  removeAction: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md },
  notFound: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,7,5,0.48)' },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  modalCard: { padding: spacing.lg, paddingBottom: spacing.xxl, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.line.soft, backgroundColor: colors.background.base },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  modalHeaderCopy: { flex: 1, minWidth: 0 },
  modalClose: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: radius.pill, backgroundColor: colors.background.raised },
  notesInput: { minHeight: 150, maxHeight: 260, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised, color: colors.text.primary, fontFamily: 'Inter-Regular', fontSize: 14, lineHeight: 22 },
  pageInputRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised },
  pageInput: { minWidth: 70, color: colors.text.primary, fontFamily: 'Inter-SemiBold', fontSize: 24 },
  modalButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cancelButton: { flex: 1, minWidth: 0, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft },
  topButtonContent: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  saveButton: { flex: 1, minWidth: 0, minHeight: 46, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: colors.gold[400] },
});
