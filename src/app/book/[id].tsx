import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

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
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);
  const moveToCollection = useLibraryStore((state) => state.moveToCollection);
  const setReadingStatus = useLibraryStore((state) => state.setReadingStatus);

  if (!book) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <AppText variant="screenTitle">Book not found</AppText>
        <PressableScale onPress={() => router.back()} style={styles.action}>
          <AppText variant="button" color="gold">Go back</AppText>
        </PressableScale>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <PressableScale onPress={() => router.back()} style={styles.back}>
        <AppText variant="button" color="gold">Back</AppText>
      </PressableScale>
      <View style={styles.hero}>
        <BookCover book={book} width={140} height={208} />
        <View style={styles.info}>
          <AppText variant="screenTitle">{book.title}</AppText>
          <AppText variant="bodyLarge" color="secondary">{book.author}</AppText>
          <AppText variant="meta" color="muted">
            {formatPageCount(book.currentPage, book.pageCount) ?? 'Page count not recorded'}
          </AppText>
        </View>
      </View>
      {book.description ? <AppText variant="bodyLarge" color="secondary" style={styles.description}>{book.description}</AppText> : null}
      <PressableScale onPress={() => toggleFavorite(book.id)} style={styles.action}>
        <AppText variant="button" color="gold">
          {book.isFavorite ? 'Remove favourite' : 'Add to favourites'}
        </AppText>
      </PressableScale>
      {book.ownership === 'wishlist' ? (
        <PressableScale onPress={() => moveToCollection(book.id)} style={styles.action}>
          <AppText variant="button" color="gold">Move to collection</AppText>
        </PressableScale>
      ) : null}
      <AppText variant="sectionTitle" style={styles.statusTitle}>Reading status</AppText>
      <View style={styles.statuses}>
        {readingStatusOrder.map((status) => (
          <PressableScale
            key={status}
            onPress={() => setReadingStatus(book.id, status)}
            style={[styles.status, book.readingStatus === status && styles.selectedStatus]}>
            <AppText variant="meta" color={book.readingStatus === status ? 'gold' : 'secondary'}>
              {readingStatusMeta[status].label}
            </AppText>
          </PressableScale>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 64,
    marginBottom: spacing.xl,
  },
  hero: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
  },
  description: {
    marginBottom: spacing.xl,
  },
  action: {
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background.elevated,
  },
  statusTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  statuses: {
    gap: spacing.sm,
  },
  status: {
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background.raised,
  },
  selectedStatus: {
    borderWidth: 1,
    borderColor: colors.gold[500],
  },
});
