import { router } from 'expo-router';
import { ArrowDownUp, Check, ChevronDown, Filter, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BookCard } from '@/components/BookCard';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { useOpenBook } from '@/hooks/useOpenBook';
import { useLibraryStore } from '@/store/library';
import { colors, radius, spacing } from '@/theme';
import type { ReadingStatus } from '@/types/book';
import { emptySearchFilters, matchesBookSearch, sortSearchResults, type SearchFilters, type SearchSortKey } from '@/utils/search';

const sortOptions: { key: SearchSortKey; label: string }[] = [
  { key: 'recent', label: 'Recently added' },
  { key: 'oldest', label: 'Oldest added' },
  { key: 'title-asc', label: 'Title: A–Z' },
  { key: 'title-desc', label: 'Title: Z–A' },
  { key: 'author-asc', label: 'Author: A–Z' },
  { key: 'year-desc', label: 'Publication year: Newest' },
  { key: 'year-asc', label: 'Publication year: Oldest' },
];
const statusOptions: { key: ReadingStatus; label: string }[] = [
  { key: 'reading', label: 'Currently reading' },
  { key: 'completed', label: 'Completed' },
  { key: 'want-to-read', label: 'Want to read' },
  { key: 'on-hold', label: 'On hold' },
];

export default function SearchScreen() {
  const books = useLibraryStore((state) => state.books);
  const shelves = useLibraryStore((state) => state.shelves);
  const openBook = useOpenBook();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(emptySearchFilters);
  const [draft, setDraft] = useState<SearchFilters>(emptySearchFilters);
  const [sort, setSort] = useState<SearchSortKey>('recent');
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);

  const genres = useMemo(() => {
    const usedIds = new Set(books.flatMap((book) => book.shelves));
    return shelves.filter((shelf) => shelf.id !== 'favorites' && usedIds.has(shelf.id));
  }, [books, shelves]);
  const authors = useMemo(() => [...new Set(books.map((book) => book.author.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [books]);
  const publishers = useMemo(() => [...new Set(books.map((book) => book.publisher?.trim()).filter((publisher): publisher is string => Boolean(publisher)))].sort((a, b) => a.localeCompare(b)), [books]);
  const results = useMemo(() => {
    return sortSearchResults(books.filter((book) => matchesBookSearch(book, query, filters)), sort);
  }, [books, filters, query, sort]);

  const activeFilterCount = filters.genres.length + filters.authors.length + filters.publishers.length + filters.statuses.length + (filters.wishlist ? 1 : 0);
  const sortLabel = sortOptions.find((option) => option.key === sort)?.label ?? 'Recently added';
  const clearCriteria = () => {
    setQuery('');
    setFilters(emptySearchFilters);
    setDraft(emptySearchFilters);
    setSort('recent');
  };

  const toggleArray = <T extends string,>(current: T[], value: T): T[] => current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  const removeFilter = (key: keyof SearchFilters, value?: string) => {
    const remove = (current: SearchFilters): SearchFilters => {
      if (key === 'wishlist') return { ...current, wishlist: false };
      if (key === 'genres' || key === 'authors' || key === 'publishers' || key === 'statuses') {
        return { ...current, [key]: current[key].filter((item) => item !== value) };
      }
      return current;
    };
    setFilters(remove);
    setDraft(remove);
  };

  return <Screen>
    <View style={styles.header}>
      <View><AppText variant="label" color="gold">FIND YOUR NEXT STORY</AppText><AppText variant="screenTitle" style={styles.heading}>Search library</AppText></View>
      <View style={styles.headerMark}><Search size={20} color={colors.gold[300]} /></View>
    </View>

    <View style={styles.searchRow}>
      <Search size={19} color={colors.gold[400]} />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Title, author or publisher"
        placeholderTextColor={colors.text.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search book title, author, or publisher"
        style={styles.searchInput}
      />
      {query.length ? <PressableScale onPress={() => setQuery('')} style={styles.clearSearch} accessibilityRole="button" accessibilityLabel="Clear search"><X size={17} color={colors.text.secondary} /></PressableScale> : null}
      <View style={styles.searchDivider} />
      <PressableScale onPress={() => setFilterVisible(true)} style={styles.filterButton} accessibilityRole="button" accessibilityLabel={`Filters${activeFilterCount ? `, ${activeFilterCount} active` : ''}`}>
        <SlidersHorizontal size={18} color={activeFilterCount ? colors.gold[200] : colors.text.secondary} />
        {activeFilterCount ? <View style={styles.filterBadge}><AppText variant="caption" color="inverse" style={styles.badgeText}>{activeFilterCount}</AppText></View> : null}
      </PressableScale>
    </View>

    {query.trim() || activeFilterCount ? <View style={styles.chipsArea}>
      <View style={styles.chipRow}>
        {query.trim() ? <ActiveChip label={`“${query.trim()}”`} onRemove={() => setQuery('')} /> : null}
        {filters.genres.map((id) => <ActiveChip key={`genre-${id}`} label={shelves.find((shelf) => shelf.id === id)?.name ?? id} onRemove={() => removeFilter('genres', id)} />)}
        {filters.authors.map((author) => <ActiveChip key={`author-${author}`} label={author} onRemove={() => removeFilter('authors', author)} />)}
        {filters.publishers.map((publisher) => <ActiveChip key={`publisher-${publisher}`} label={publisher} onRemove={() => removeFilter('publishers', publisher)} />)}
        {filters.statuses.map((status) => <ActiveChip key={`status-${status}`} label={statusOptions.find((option) => option.key === status)?.label ?? status} onRemove={() => removeFilter('statuses', status)} />)}
        {filters.wishlist ? <ActiveChip label="Wishlist" onRemove={() => removeFilter('wishlist')} /> : null}
      </View>
      <PressableScale onPress={clearCriteria} style={styles.clearAll} accessibilityRole="button" accessibilityLabel="Clear search and all filters"><AppText variant="caption" color="gold">Clear all</AppText></PressableScale>
    </View> : null}

    <View style={styles.resultsToolbar}>
      <View><AppText variant="sectionTitle">Your books</AppText><AppText variant="caption" color="muted">{results.length} {results.length === 1 ? 'match' : 'matches'}</AppText></View>
      <PressableScale onPress={() => setSortVisible((visible) => !visible)} style={styles.sortButton} accessibilityRole="button" accessibilityLabel={`Sort by ${sortLabel}`}>
        <View style={styles.sortContent}>
          <ArrowDownUp size={15} color={colors.gold[300]} /><AppText variant="caption" color="secondary">{sortLabel}</AppText><ChevronDown size={14} color={colors.text.muted} />
        </View>
      </PressableScale>
    </View>

    {sortVisible ? <View style={styles.sortPanel}>{sortOptions.map((option) => <PressableScale key={option.key} onPress={() => { setSort(option.key); setSortVisible(false); }} style={styles.sortOption} accessibilityRole="button" accessibilityState={{ selected: sort === option.key }}><AppText variant="meta" color={sort === option.key ? 'goldSoft' : 'secondary'}>{option.label}</AppText>{sort === option.key ? <Check size={16} color={colors.gold[300]} /> : null}</PressableScale>)}</View> : null}

    {books.length === 0 ? <EmptyState title="Your library is still quiet" body="Add a book to begin searching your personal collection." action="Add a book" onPress={() => router.push('/add-book')} /> : results.length ? results.map((book) => <BookCard key={book.id} book={book} onPress={() => openBook(book.id)} />) : <EmptyState title="No matching books" body={query.trim() ? 'Try another title, author, or publisher, or loosen your filters.' : 'Try removing a filter to see more of your library.'} action={query.trim() || activeFilterCount ? 'Clear search and filters' : undefined} onPress={clearCriteria} />}

    <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.scrim} onPress={() => setFilterVisible(false)} accessibilityRole="button" accessibilityLabel="Dismiss filters" />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}><View><AppText variant="screenTitle">Refine your search</AppText><AppText variant="caption" color="secondary" style={styles.sheetSubtitle}>Choose any combination of details.</AppText></View><PressableScale onPress={() => setFilterVisible(false)} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close filters"><X size={18} color={colors.text.secondary} /></PressableScale></View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            <FilterGroup title="Collection">
              <FilterChip label="Wishlist" selected={draft.wishlist} onPress={() => setDraft((current) => ({ ...current, wishlist: !current.wishlist }))} />
            </FilterGroup>
            <FilterGroup title="Reading status">
              {statusOptions.map((option) => <FilterChip key={option.key} label={option.label} selected={draft.statuses.includes(option.key)} onPress={() => setDraft((current) => ({ ...current, statuses: toggleArray(current.statuses, option.key) }))} />)}
            </FilterGroup>
            <FilterGroup title="Genre / shelf">
              {genres.length ? genres.map((genre) => <FilterChip key={genre.id} label={genre.name} selected={draft.genres.includes(genre.id)} onPress={() => setDraft((current) => ({ ...current, genres: toggleArray(current.genres, genre.id) }))} />) : <AppText variant="caption" color="muted">No shelf tags in your books yet.</AppText>}
            </FilterGroup>
            <FilterGroup title="Author">
              {authors.length ? authors.map((author) => <FilterChip key={author} label={author} selected={draft.authors.includes(author)} onPress={() => setDraft((current) => ({ ...current, authors: toggleArray(current.authors, author) }))} />) : <AppText variant="caption" color="muted">No author names available.</AppText>}
            </FilterGroup>
            <FilterGroup title="Publisher">
              {publishers.length ? publishers.map((publisher) => <FilterChip key={publisher} label={publisher} selected={draft.publishers.includes(publisher)} onPress={() => setDraft((current) => ({ ...current, publishers: toggleArray(current.publishers, publisher) }))} />) : <AppText variant="caption" color="muted">No publisher information available.</AppText>}
            </FilterGroup>
          </ScrollView>
          <View style={styles.sheetFooter}>
            <PressableScale onPress={() => { setDraft(emptySearchFilters); setFilters(emptySearchFilters); }} style={styles.sheetClear} accessibilityRole="button" accessibilityLabel="Clear all filter selections"><AppText variant="meta" color="secondary">Clear all</AppText></PressableScale>
            <PressableScale onPress={() => { setFilters(draft); setFilterVisible(false); }} style={styles.applyButton} accessibilityRole="button" accessibilityLabel="Apply filters"><View style={styles.applyContent}>
    <AppText variant="button" color="inverse">Apply filters</AppText>
  </View></PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  </Screen>;
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <PressableScale onPress={onRemove} style={styles.activeChip} accessibilityRole="button" accessibilityLabel={`Remove ${label} filter`}><View style={styles.activeFilterContent}><AppText variant="caption" color="goldSoft" numberOfLines={1}>{label}</AppText><X size={12} color={colors.gold[300]} /></View></PressableScale>;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.filterGroup}><AppText variant="meta" color="goldSoft" style={styles.groupTitle}>{title}</AppText><View style={styles.filterChoices}>{children}</View></View>;
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={styles.filterChipContent}>
        <AppText variant="caption" color={selected ? 'goldSoft' : 'secondary'} numberOfLines={1} style={styles.filterChipLabel}>
          {label}
        </AppText>
        {selected ? <Check size={13} color={colors.gold[300]} /> : null}
      </View>
    </PressableScale>
  );
}

function EmptyState({ title, body, action, onPress }: { title: string; body: string; action?: string; onPress: () => void }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Filter size={20} color={colors.gold[300]} /></View><AppText variant="sectionTitle">{title}</AppText><AppText variant="body" color="secondary" style={styles.emptyBody}>{body}</AppText>{action ? <PressableScale onPress={onPress} style={styles.emptyAction} accessibilityRole="button" accessibilityLabel={action}><AppText variant="meta" color="gold">{action}</AppText></PressableScale> : null}</View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs, marginBottom: spacing.lg },
  heading: { marginTop: spacing.xs },
  headerMark: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised },
  searchRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.strong, backgroundColor: colors.background.raised },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: spacing.md, color: colors.text.primary, fontFamily: 'Inter-Regular', fontSize: 14 },
  clearSearch: { width: 30, height: 36, justifyContent: 'center', alignItems: 'center' },
  searchDivider: { height: 26, width: 1, backgroundColor: colors.line.soft },
  filterButton: { position: 'relative', width: 36, height: 38, justifyContent: 'center', alignItems: 'center' },
  filterBadge: { position: 'absolute', top: -1, right: -2, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.gold[400] },
  badgeText: { fontSize: 9, lineHeight: 13 },
  chipsArea: { marginTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  activeChip: { maxWidth: 190, minHeight: 28, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: 'rgba(198,166,107,0.1)' },
  activeFilterContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  clearAll: { alignSelf: 'flex-end', paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  resultsToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xxl, marginBottom: spacing.md },
  sortButton: { minHeight: 36, maxWidth: '58%', flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  sortPanel: { marginBottom: spacing.md, padding: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised },
  sortOption: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line.hairline },
  empty: { alignItems: 'center', padding: spacing.xxl, marginTop: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: 'rgba(20,26,21,0.72)' },
  emptyIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, borderRadius: radius.pill, backgroundColor: 'rgba(198,166,107,0.12)' },
  emptyBody: { textAlign: 'center', marginTop: spacing.xs, lineHeight: 20 },
  emptyAction: { marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,7,5,0.42)' },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sheet: { maxHeight: '88%', paddingTop: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.line.soft, backgroundColor: colors.background.base },
  sheetHandle: { width: 42, height: 4, alignSelf: 'center', marginBottom: spacing.md, borderRadius: radius.pill, backgroundColor: colors.line.strong },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.md },
  sheetSubtitle: { marginTop: spacing.xxs },
  closeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.background.raised },
  filterContent: { paddingBottom: spacing.md },
  filterGroup: { marginTop: spacing.sm },
  groupTitle: { marginBottom: spacing.sm },
  filterChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterChip: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line.hairline, backgroundColor: colors.background.raised },
  filterChipSelected: { borderColor: colors.gold[500], backgroundColor: 'rgba(198,166,107,0.13)' },
  sheetFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line.hairline },
  sheetClear: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md },
  applyButton: { flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.gold[400] },
  sortContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  applyContent: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  filterChipContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterChipLabel: { flexShrink: 1 },
});
