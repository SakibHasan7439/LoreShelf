import { Castle, Feather, FlaskConical, Landmark, Scroll, Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';
import type { Shelf } from '@/types/shelf';

const glyphs = { castle: Castle, feather: Feather, landmark: Landmark, scroll: Scroll, flask: FlaskConical, star: Star };

export function ShelfMark({ shelf, size = 18 }: { shelf: Shelf; size?: number }) {
  const Icon = glyphs[shelf.glyph];
  return <View style={[styles.mark, { backgroundColor: `${shelf.tint[0]}CC` }]}><Icon size={size} color={colors.gold[200]} strokeWidth={1.7} /></View>;
}

const styles = StyleSheet.create({
  mark: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline },
});

