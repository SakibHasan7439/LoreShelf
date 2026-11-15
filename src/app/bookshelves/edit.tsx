import { router, useLocalSearchParams } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ShelfMark } from '@/components/shelves/ShelfMark';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/theme';
import type { ShelfGlyph } from '@/types/shelf';
import { useLibraryStore } from '@/store/library';

const themes: readonly (readonly [string, string])[] = [
  ['#294537', '#101A14'], ['#34302A', '#17130F'], ['#442B36', '#1B1118'],
  ['#2B3447', '#121722'], ['#514126', '#211A10'], ['#3A2F4B', '#19131F'],
];
const glyphOptions: readonly ShelfGlyph[] = ['castle', 'feather', 'landmark', 'scroll', 'flask', 'star'];

export default function EditShelfScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useLibraryStore((state) => state.shelves.find((shelf) => shelf.id === id));
  const createShelf = useLibraryStore((state) => state.createShelf);
  const updateShelf = useLibraryStore((state) => state.updateShelf);
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [tint, setTint] = useState<readonly [string, string]>(existing?.tint ?? themes[0]);
  const [glyph, setGlyph] = useState<ShelfGlyph>(existing?.glyph ?? 'castle');
  const preview = useMemo(() => ({ id: existing?.id ?? 'preview', name: name.trim() || 'A new shelf', description, tagline: description || 'A collection of stories', tint, glyph }), [description, existing?.id, glyph, name, tint]);

  const save = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Give your shelf a name', 'Shelf names help you find the right story collection.');
      return;
    }
    const data = { name: trimmedName, description: description.trim() || undefined, tagline: description.trim() || 'A collection of stories', tint, glyph };
    const saved = existing ? updateShelf(existing.id, data) : createShelf(data);
    if (!saved) {
      Alert.alert('Shelf name already used', 'Choose a different name for this shelf.');
      return;
    }
    router.back();
  };

  return <Screen>
    <View style={styles.topBar}><PressableScale onPress={() => router.back()} style={styles.roundAction} accessibilityRole="button" accessibilityLabel="Cancel"><X size={19} color={colors.text.secondary} /></PressableScale><AppText variant="meta" color="gold">{existing ? 'MAKE IT YOURS' : 'A NEW COLLECTION'}</AppText><View style={styles.roundAction} /></View>
    <AppText variant="screenTitle" style={styles.heading}>{existing ? 'Edit shelf' : 'Create a shelf'}</AppText>
    <AppText variant="body" color="secondary" style={styles.subtitle}>Give this little corner of your library its own character.</AppText>

    <AppText variant="label" color="gold" style={styles.label}>A SNEAK PEEK</AppText>
    <View style={styles.previewCard}><LinearGradient colors={[...tint]} style={StyleSheet.absoluteFill} /><ShelfMark shelf={preview} /><View style={styles.previewText}><AppText variant="sectionTitle" numberOfLines={1}>{preview.name}</AppText><AppText variant="caption" color="secondary" numberOfLines={1}>{preview.description || 'A collection of stories'}</AppText></View><View style={styles.previewPlank} /></View>

    <AppText variant="label" color="gold" style={styles.label}>SHELF NAME *</AppText>
    <TextInput value={name} onChangeText={setName} placeholder="e.g. Worlds to wander" placeholderTextColor={colors.text.muted} maxLength={40} returnKeyType="next" style={styles.input} accessibilityLabel="Shelf name" />
    <View style={styles.fieldMeta}><AppText variant="caption" color="muted">Choose a name you’ll remember</AppText><AppText variant="caption" color="muted">{name.length}/40</AppText></View>

    <AppText variant="label" color="gold" style={styles.label}>DESCRIPTION · OPTIONAL</AppText>
    <TextInput value={description} onChangeText={setDescription} placeholder="A note about this collection" placeholderTextColor={colors.text.muted} maxLength={72} style={[styles.input, styles.descriptionInput]} multiline accessibilityLabel="Shelf description" />

    <AppText variant="label" color="gold" style={styles.label}>CHOOSE A TONE</AppText>
    <View style={styles.themeRow}>{themes.map((theme) => <PressableScale key={theme[0]} onPress={() => setTint(theme)} style={[styles.themeSwatch, tint[0] === theme[0] && styles.selectedSwatch]} accessibilityRole="button" accessibilityLabel={`Select ${theme[0]} shelf color`}><LinearGradient colors={[...theme]} style={styles.swatchFill}>{tint[0] === theme[0] ? <Check size={16} color={colors.gold[200]} /> : null}</LinearGradient></PressableScale>)}</View>

    <AppText variant="label" color="gold" style={styles.label}>CHOOSE AN EMBLEM</AppText>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.glyphRow}>{glyphOptions.map((option) => {
      const candidate = { ...preview, glyph: option };
      return <PressableScale key={option} onPress={() => setGlyph(option)} style={[styles.glyphOption, glyph === option && styles.selectedGlyph]} accessibilityRole="button" accessibilityLabel={`Select ${option} emblem`}><ShelfMark shelf={candidate} size={18} /></PressableScale>;
    })}</ScrollView>

    <View style={styles.footer}><PressableScale onPress={() => router.back()} style={styles.cancelButton} accessibilityRole="button" accessibilityLabel="Cancel shelf editing"><AppText variant="button" color="secondary">Cancel</AppText></PressableScale><PressableScale onPress={save} style={styles.saveButton} accessibilityRole="button" accessibilityLabel={existing ? 'Save shelf changes' : 'Create shelf'}><View style={styles.saveInner}><Check size={17} color={colors.text.inverse} /><AppText variant="button" color="inverse">{existing ? 'Save changes' : 'Create shelf'}</AppText></View></PressableScale></View>
  </Screen>;
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  roundAction: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  heading: { marginTop: spacing.md },
  subtitle: { marginTop: spacing.xs },
  label: { marginTop: spacing.xl, marginBottom: spacing.sm },
  previewCard: { minHeight: 114, flexDirection: 'row', alignItems: 'center', gap: spacing.md, overflow: 'hidden', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line.soft },
  previewText: { flex: 1 },
  previewPlank: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 0, height: 4, backgroundColor: 'rgba(198,166,107,0.5)' },
  input: { minHeight: 50, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised, color: colors.text.primary, fontFamily: 'Inter-Regular', fontSize: 14 },
  descriptionInput: { minHeight: 72, paddingTop: spacing.md, textAlignVertical: 'top' },
  fieldMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  themeSwatch: { flex: 1, height: 48, padding: 3, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline },
  selectedSwatch: { borderColor: colors.gold[300] },
  swatchFill: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  glyphRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  glyphOption: { padding: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.hairline },
  selectedGlyph: { borderColor: colors.gold[300], backgroundColor: 'rgba(198,166,107,0.1)' },
  footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.md },
  cancelButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft },
  saveButton: { flex: 1, minHeight: 50, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.gold[400] },
  saveInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
