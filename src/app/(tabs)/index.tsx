import { router } from 'expo-router';
import { ArrowUpRight, Bookmark, BookOpen, Check, Library, Plus, Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { profile } from '@/data/profile';
import { useOpenBook } from '@/hooks/useOpenBook';
import { useLibraryStore } from '@/store/library';
import { colors, fonts, radius, spacing } from '@/theme';
import type { Book } from '@/types/book';
import { sortByAddedAtDesc } from '@/utils/book';
import { getGreeting } from '@/utils/date';

const COVER_WIDTH = 96;
const COVER_HEIGHT = 142;

export default function HomeScreen() {
  const books = useLibraryStore((state) => state.books);
  const reading = useMemo(() => books.filter((book) => book.readingStatus === 'reading'), [books]);
  const owned = useMemo(() => books.filter((book) => book.ownership === 'owned'), [books]);
  const completed = useMemo(() => books.filter((book) => book.readingStatus === 'completed'), [books]);
  const wishlist = useMemo(() => books.filter((book) => book.ownership === 'wishlist'), [books]);
  const recent = useMemo(() => sortByAddedAtDesc(books).slice(0, 8), [books]);
  const completedThisMonth = useMemo(() => {
    const now = new Date();
    return completed.filter((book) => {
      if (!book.finishedAt) return false;
      const date = new Date(book.finishedAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }).length;
  }, [completed]);
  const openBook = useOpenBook();

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="label" color="gold">{getGreeting()}</AppText>
          <AppText variant="hero" style={styles.title}>Your Library</AppText>
          <AppText variant="body" color="secondary">Every book holds a new world.</AppText>
        </View>
        <PressableScale onPress={() => router.push('/(tabs)/profile')} style={styles.avatarButton} accessibilityRole="button" accessibilityLabel="Open profile">
          <View style={styles.avatar}><AppText variant="button" color="goldSoft">{profile.initials}</AppText></View>
        </PressableScale>
      </View>

      <View style={styles.stats}>
        <Stat icon={<Library size={16} color={colors.gold[300]} />} label="Books" value={owned.length} />
        <Stat icon={<BookOpen size={16} color={colors.emerald[200]} />} label="Reading" value={reading.length} />
        <Stat icon={<Check size={16} color={colors.gold[300]} />} label="Completed" value={completed.length} />
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <View style={styles.progressTitleWrap}>
            <View style={styles.iconBadge}><Sparkles size={15} color={colors.gold[300]} /></View>
            <View>
              <AppText variant="meta" color="gold">THIS MONTH</AppText>
              <AppText variant="sectionTitle" style={styles.progressTitle}>Reading progress</AppText>
            </View>
          </View>
          <AppText variant="display" color="gold">{completedThisMonth}</AppText>
        </View>
        <View style={styles.monthlyNote}>
          <View style={styles.monthlyDot} />
          <AppText variant="caption" color="secondary">
            {completedThisMonth === 1 ? '1 book finished this month' : `${completedThisMonth} books finished this month`} · Monthly goal not set
          </AppText>
        </View>
      </View>

      <SectionHeading title="Continue reading" />
      {reading.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {reading.map((book) => <ReadingCard key={book.id} book={book} onPress={() => openBook(book.id)} />)}
        </ScrollView>
      ) : <EmptyCard icon={<BookOpen size={19} color={colors.gold[300]} />} title="A story awaits" body="Add a book to your collection and begin a new reading journey." action="Add a book" onPress={() => router.push('/add-book')} />}

      <SectionHeading title="Recently added" actionLabel="View all" onActionPress={() => router.push('/(tabs)/collection')} style={styles.sectionHeading} />
      {recent.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {recent.map((book) => <BookTile key={book.id} book={book} onPress={() => openBook(book.id)} />)}
        </ScrollView>
      ) : <EmptyCard icon={<Library size={19} color={colors.gold[300]} />} title="Your library is waiting" body="Save the books you love, all in one place." action="Add your first book" onPress={() => router.push('/add-book')} />}

      <SectionHeading title="Your wishlist" actionLabel="View all" onActionPress={() => router.push('/(tabs)/wishlist')} style={styles.sectionHeading} />
      {wishlist.length ? (
        <View style={styles.wishlistPanel}>
          <View style={styles.wishlistIntro}>
            <View style={styles.wishlistIcon}><Bookmark size={16} color={colors.gold[300]} /></View>
            <AppText variant="caption" color="secondary">Stories saved for another day</AppText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {wishlist.slice(0, 6).map((book) => <BookTile key={book.id} book={book} onPress={() => openBook(book.id)} compact />)}
          </ScrollView>
        </View>
      ) : <EmptyCard icon={<Bookmark size={19} color={colors.gold[300]} />} title="A space for future favorites" body="Keep a note of the books you hope to read." action="Browse your wishlist" onPress={() => router.push('/(tabs)/wishlist')} />}

      <SectionHeading title="A little direction" style={styles.sectionHeading} />
      <View style={styles.actions}>
        <QuickAction icon={<Plus size={17} color={colors.text.inverse} />} title="Add a book" subtitle="Welcome a new story" primary onPress={() => router.push('/add-book')} />
        <QuickAction icon={<Library size={17} color={colors.gold[300]} />} title="My collection" subtitle={`${owned.length} books on your shelves`} onPress={() => router.push('/(tabs)/collection')} />
      </View>
    </Screen>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <View style={styles.stat}><View style={styles.statTop}>{icon}<AppText variant="caption" color="secondary">{label}</AppText></View><AppText variant="display" color="goldSoft" style={styles.statValue}>{value}</AppText></View>;
}

function ReadingCard({ book, onPress }: { book: Book; onPress: () => void }) {
  const progress = book.pageCount && book.currentPage ? Math.min(100, Math.round((book.currentPage / book.pageCount) * 100)) : null;
  return <PressableScale onPress={onPress} style={styles.readingCard} accessibilityRole="button" accessibilityLabel={`Continue reading ${book.title}`}>
    <View style={styles.readingCover}><BookCover book={book} width={108} height={154} /><View style={styles.coverTag}><BookOpen size={11} color={colors.gold[200]} /><AppText variant="meta" color="goldSoft">IN PROGRESS</AppText></View></View>
    <View style={styles.readingDetails}><AppText variant="cardTitle" numberOfLines={1}>{book.title}</AppText><AppText variant="caption" color="secondary" numberOfLines={1}>{book.author}</AppText>{progress !== null ? <><View style={styles.bookProgressTrack}><View style={[styles.bookProgressFill, { width: `${progress}%` }]} /></View><AppText variant="meta" color="muted">{progress}% complete</AppText></> : <AppText variant="meta" color="muted">Open your book</AppText>}</View>
  </PressableScale>;
}

function BookTile({ book, onPress, compact = false }: { book: Book; onPress: () => void; compact?: boolean }) {
  return <PressableScale onPress={onPress} style={[styles.bookTile, compact && styles.compactTile]} accessibilityRole="button" accessibilityLabel={`Open ${book.title}`}>
    <BookCover book={book} width={COVER_WIDTH} height={COVER_HEIGHT} />
    <AppText variant="meta" numberOfLines={2} style={styles.bookTitle}>{book.title}</AppText>
    <AppText variant="caption" color="muted" numberOfLines={1}>{book.author}</AppText>
  </PressableScale>;
}

function EmptyCard({ icon, title, body, action, onPress }: { icon: React.ReactNode; title: string; body: string; action: string; onPress: () => void }) {
  return <View style={styles.emptyCard}><View style={styles.emptyIcon}>{icon}</View><View style={styles.emptyCopy}><AppText variant="cardTitle">{title}</AppText><AppText variant="caption" color="secondary" style={styles.emptyBody}>{body}</AppText><PressableScale onPress={onPress} style={styles.emptyAction} accessibilityRole="button" accessibilityLabel={action}><View style={styles.actionRow}><AppText variant="meta" color="gold">{action}</AppText><ArrowUpRight size={14} color={colors.gold[400]} /></View></PressableScale></View></View>;
}

function QuickAction({ icon, title, subtitle, primary = false, onPress }: { icon: React.ReactNode; title: string; subtitle: string; primary?: boolean; onPress: () => void }) {
  return <PressableScale onPress={onPress} style={[styles.quickAction, primary && styles.quickActionPrimary]} accessibilityRole="button" accessibilityLabel={title}><View style={[styles.quickIcon, primary && styles.quickIconPrimary]}>{icon}</View><View style={styles.quickCopy}><AppText variant="meta" color={primary ? 'inverse' : 'primary'}>{title}</AppText><AppText variant="caption" color={primary ? 'inverse' : 'muted'} numberOfLines={1}>{subtitle}</AppText></View><ArrowUpRight size={15} color={primary ? colors.text.inverse : colors.gold[500]} /></PressableScale>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs, marginBottom: spacing.xl },
  headerCopy: { flex: 1 },
  title: { marginTop: spacing.xxs, marginBottom: spacing.xxs, fontFamily: fonts.serif.semibold },
  avatarButton: { width: 48, height: 48, flexShrink: 0 },
  avatar: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.strong, backgroundColor: colors.background.raised },
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  stat: { flex: 1, minHeight: 88, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: 'rgba(20, 26, 21, 0.88)' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statValue: { marginTop: spacing.xs, fontSize: 29, lineHeight: 32 },
  progressCard: { padding: spacing.lg, marginBottom: spacing.xxl, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: 'rgba(27, 36, 29, 0.94)' },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  progressTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBadge: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(198,166,107,0.12)' },
  progressTitle: { marginTop: 1 },
  monthlyNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  monthlyDot: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: colors.gold[400] },
  rail: { gap: spacing.md, paddingRight: spacing.lg, paddingBottom: spacing.xs },
  readingCard: { width: 264, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised },
  readingCover: { position: 'relative', width: 108, height: 154 },
  coverTag: { position: 'absolute', left: 5, right: 5, bottom: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, paddingVertical: 4, borderRadius: radius.xs, backgroundColor: 'rgba(9,12,10,0.84)' },
  readingDetails: { flex: 1, gap: spacing.xs },
  bookProgressTrack: { height: 4, marginTop: spacing.sm, overflow: 'hidden', borderRadius: radius.pill, backgroundColor: colors.background.deep },
  bookProgressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.emerald[300] },
  sectionHeading: { marginTop: spacing.xxl },
  bookTile: { width: COVER_WIDTH, gap: spacing.xs },
  compactTile: { width: 84 },
  bookTitle: { lineHeight: 17, minHeight: 34 },
  wishlistPanel: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(143,179,156,0.18)', backgroundColor: 'rgba(20,29,23,0.78)' },
  wishlistIntro: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  wishlistIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: 'rgba(198,166,107,0.1)' },
  emptyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: 'rgba(20,26,21,0.72)' },
  emptyIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: 'rgba(198,166,107,0.1)' },
  emptyCopy: { flex: 1 },
  emptyBody: { marginTop: spacing.xs, lineHeight: 18 },
  emptyAction: { alignSelf: 'flex-start', marginTop: spacing.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actions: { gap: spacing.sm },
  quickAction: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  quickActionPrimary: { borderColor: 'rgba(198,166,107,0.42)', backgroundColor: colors.gold[400] },
  quickIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: 'rgba(198,166,107,0.12)' },
  quickIconPrimary: { backgroundColor: 'rgba(18,23,15,0.12)' },
  quickCopy: { flex: 1, gap: 2 },
});
