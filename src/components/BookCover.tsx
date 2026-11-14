import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, gradients, radius } from '@/theme';
import type { Book } from '@/types/book';
import { coverPalettes } from '@/utils/cover';

interface BookCoverProps {
  book: Book;
  width?: number;
  height?: number;
}

export function BookCover({ book, width = 92, height = 136 }: BookCoverProps) {
  const palette = coverPalettes[book.coverTheme];

  return (
    <View style={[styles.container, { width, height }]}>
      {book.coverUrl ? (
        <Image
          source={book.coverUrl}
          contentFit="cover"
          transition={150}
          style={styles.image}
        />
      ) : (
        <LinearGradient colors={[palette.from, palette.to]} style={styles.image}>
          <AppText color="goldSoft" variant="label" numberOfLines={2} style={styles.fallbackText}>
            {book.title}
          </AppText>
          <View style={[styles.rule, { backgroundColor: palette.accent }]} />
          <AppText color="secondary" variant="caption" numberOfLines={1}>
            {book.author}
          </AppText>
        </LinearGradient>
      )}
      <LinearGradient colors={gradients.coverShade} style={styles.shade} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: radius.xs,
    backgroundColor: colors.background.elevated,
  },
  image: {
    ...StyleSheet.absoluteFill,
    padding: 10,
    justifyContent: 'center',
  },
  shade: {
    ...StyleSheet.absoluteFill,
  },
  fallbackText: {
    textAlign: 'center',
  },
  rule: {
    height: 1,
    marginVertical: 8,
    opacity: 0.8,
  },
});
