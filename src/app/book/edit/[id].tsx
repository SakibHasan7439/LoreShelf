import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { useLibraryStore } from '@/store/library';
import { colors, radius, spacing } from '@/theme';

export default function EditBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useLibraryStore((state) => state.books.find((item) => item.id === id));
  const updateBook = useLibraryStore((state) => state.updateBook);
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [publisher, setPublisher] = useState(book?.publisher ?? '');
  const [description, setDescription] = useState(book?.description ?? '');
  const [isbn, setIsbn] = useState(book?.isbn ?? '');
  const [publicationDate, setPublicationDate] = useState(book?.publicationDate ?? (book?.publishedYear ? String(book.publishedYear) : ''));
  const [pageCount, setPageCount] = useState(book?.pageCount === undefined ? '' : String(book.pageCount));

  if (!book) return <Screen><AppText variant="screenTitle">Book not found</AppText><PressableScale onPress={() => router.back()} style={styles.back}><ArrowLeft size={17} color={colors.gold[300]} /><AppText variant="meta" color="gold">Go back</AppText></PressableScale></Screen>;

  const save = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('Title and author are required', 'Add both details before saving your book.');
      return;
    }
    const pages = pageCount.trim() ? Number(pageCount) : undefined;
    if (pages !== undefined && (!Number.isInteger(pages) || pages < 1)) {
      Alert.alert('Check the page count', 'Enter a whole number greater than zero, or leave it blank.');
      return;
    }
    const yearMatch = publicationDate.match(/\b\d{4}\b/);
    updateBook(book.id, {
      title,
      author,
      publisher: publisher.trim() || undefined,
      description: description.trim() || undefined,
      isbn: isbn.trim() || undefined,
      publicationDate: publicationDate.trim() || undefined,
      publishedYear: yearMatch ? Number(yearMatch[0]) : undefined,
      pageCount: pages,
    });
    router.back();
  };

  return <Screen>
    <PressableScale onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Cancel editing"><ArrowLeft size={17} color={colors.gold[300]} /><AppText variant="meta" color="gold">Back to book</AppText></PressableScale>
    <AppText variant="label" color="gold" style={styles.eyebrow}>YOUR PERSONAL EDITION</AppText>
    <AppText variant="screenTitle" style={styles.heading}>Edit book details</AppText>
    <AppText variant="body" color="secondary" style={styles.subtitle}>Keep the details that matter to your library.</AppText>

    <Field label="TITLE *" value={title} onChangeText={setTitle} placeholder="Book title" />
    <Field label="AUTHOR *" value={author} onChangeText={setAuthor} placeholder="Author name" />
    <Field label="PUBLISHER" value={publisher} onChangeText={setPublisher} placeholder="Publisher" />
    <Field label="ISBN" value={isbn} onChangeText={setIsbn} placeholder="ISBN" />
    <Field label="PUBLICATION DATE OR YEAR" value={publicationDate} onChangeText={setPublicationDate} placeholder="e.g. 2020" />
    <Field label="PAGE COUNT" value={pageCount} onChangeText={setPageCount} placeholder="Leave blank if unknown" keyboardType="number-pad" />
    <Field label="DESCRIPTION" value={description} onChangeText={setDescription} placeholder="A short description" multiline />

    <View style={styles.footer}>
      <PressableScale onPress={() => router.back()} style={styles.cancel} accessibilityRole="button" accessibilityLabel="Cancel book changes">,
        <AppText variant="meta" color="secondary">
          Cancel
        </AppText>
      </PressableScale>
      <PressableScale onPress={save} style={styles.save} accessibilityRole="button" accessibilityLabel="Save book changes">
        <View style={styles.saveInner}>
          <Check size={17} color={colors.text.inverse} style={{ marginLeft: 8 }} 
          />
            <AppText variant="button" color="inverse">Save changes</AppText>
        </View>
      </PressableScale>
    </View>
  </Screen>;
}

function Field({ label, value, onChangeText, placeholder, multiline = false, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'default' | 'number-pad' }) {
  return <View style={styles.field}><AppText variant="label" color="gold">{label}</AppText><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.text.muted} multiline={multiline} keyboardType={keyboardType} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, multiline && styles.textarea]} accessibilityLabel={label} /></View>;
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.lg },
  eyebrow: { marginBottom: spacing.xs },
  heading: {},
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.md },
  field: { gap: spacing.xs, marginTop: spacing.md },
  input: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft, backgroundColor: colors.background.raised, color: colors.text.primary, fontFamily: 'Inter-Regular', fontSize: 14 },
  textarea: { minHeight: 100, paddingTop: spacing.md },
  footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.md },
  cancel: { minHeight: 50, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line.soft },
  save: { flex: 1, minHeight: 50, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.gold[400] },
  saveInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
