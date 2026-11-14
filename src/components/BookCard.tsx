import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, spacing } from '@/theme';
import type { Book } from '@/types/book';
import { getReadingProgress } from '@/utils/book';

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

export function BookCard({ book, onPress }: BookCardProps) {
  const progress = getReadingProgress(book);

  return (
    <PressableScale onPress={onPress} style={styles.wrapper} accessibilityRole="button">
      <View style={styles.card}>
        <BookCover book={book} width={78} height={116} />
        <View style={styles.info}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {book.title}
          </AppText>
          <AppText variant="meta" color="secondary" numberOfLines={1}>
            {book.author}
          </AppText>
          <AppText variant="caption" color="muted">
            {book.readingStatus === 'completed' ? 'Completed' : book.readingStatus}
          </AppText>
          {progress > 0 && progress < 1 ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progress, { width: `${progress * 100}%` }]} />
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line.hairline,
    backgroundColor: colors.background.raised,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  progressTrack: {
    height: 4,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.background.elevated,
  },
  progress: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.gold[400],
  },
});
