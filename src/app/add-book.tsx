import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { BookCover } from '@/components/BookCover';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useLibraryStore } from '@/store/library';
import { colors, fonts, radius, spacing } from '@/theme';
import type { Book } from '@/types/book';
import { getCoverTheme } from '@/utils/cover';
import { searchBooks, type BookSearchResult } from '@/services/books/bookSearch';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldError {
  title?: string;
  author?: string;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AddBookScreen() {
  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [notes, setNotes] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldError>({});
  const [step, setStep] = useState<'form' | 'results' | 'preview'>('form');
  const [candidates, setCandidates] = useState<BookSearchResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<BookSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [savedBook, setSavedBook] = useState<Book | null>(null);
  const saveProgress = useSharedValue(0);
  const saveProgressRef = useRef(saveProgress);
  const reduceMotion = useReducedMotion();
  const saveInProgress = useRef(false);

  const addBook = useLibraryStore((state) => state.addBook);
  const books = useLibraryStore((state) => state.books);

  // Live-preview book constructed from current form state
  const formPreviewBook = useMemo<Book>(
    () => ({
      id: '__preview__',
      title: title.trim() || 'Book Title',
      author: author.trim() || 'Author Name',
      coverUrl: coverUri ?? undefined,
      coverTheme: getCoverTheme(title.trim() || '__preview__'),
      addedAt: '',
      readingStatus: 'want-to-read',
      ownership: 'wishlist',
      shelves: [],
      isFavorite: false,
    }),
    [title, author, coverUri],
  );

  const previewBook = useMemo<Book>(() => {
    if (!selectedCandidate) return formPreviewBook;
    return {
      ...formPreviewBook,
      title: selectedCandidate.title,
      author: selectedCandidate.authors.join(', ') || author.trim() || 'Author Name',
      publisher: selectedCandidate.publisher,
      description: selectedCandidate.description,
      isbn: selectedCandidate.isbn,
      publicationDate: selectedCandidate.publicationDate,
      pageCount: selectedCandidate.pageCount,
      externalId: selectedCandidate.externalId,
      providerSource: selectedCandidate.source,
      source: selectedCandidate.source,
      coverUrl: coverUri ?? selectedCandidate.cover,
      customCoverUri: coverUri ?? undefined,
      isCustom: false,
      coverSource: selectedCandidate.source,
    };
  }, [selectedCandidate, formPreviewBook, author, coverUri]);

  const duplicateBooks = useMemo(() => {
    const titleKey = (selectedCandidate?.title ?? title).trim().toLocaleLowerCase();
    const authorsKey = (selectedCandidate?.authors.join(', ') || author).trim().toLocaleLowerCase();
    const isbn = selectedCandidate?.isbn?.replace(/[-\s]/g, '').toUpperCase();
    return books.filter((book) => {
      const bookIsbn = book.isbn?.replace(/[-\s]/g, '').toUpperCase();
      if (isbn && bookIsbn) return bookIsbn === isbn;
      return book.title.trim().toLocaleLowerCase() === titleKey
        && book.author.trim().toLocaleLowerCase() === authorsKey;
    });
  }, [books, selectedCandidate, title, author]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validate = useCallback((): boolean => {
    const next: FieldError = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!author.trim()) next.author = 'Author is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [title, author]);

  // ---------------------------------------------------------------------------
  // Image picker
  // ---------------------------------------------------------------------------

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCoverUri(result.assets[0].uri);
    }
  }, []);

  const handleRemoveCover = useCallback(() => setCoverUri(null), []);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSearching(true);
    setSearchFailed(false);
    try {
      const matches = await searchBooks({
        title: title.trim(),
        author: author.trim(),
        publisher: publisher.trim() || undefined,
      });
      setCandidates(matches);
      setSelectedCandidate(null);
      setStep('results');
    } catch {
      setSearchFailed(true);
      setCandidates([]);
      setSelectedCandidate(null);
      setStep('results');
    } finally {
      setIsSearching(false);
    }
  }, [title, author, publisher, validate]);

  const handleSelectCandidate = useCallback((candidate: BookSearchResult) => {
    setSelectedCandidate(candidate);
    setStep('preview');
  }, []);

  const handleManualCreation = useCallback(() => {
    setSelectedCandidate(null);
    setStep('preview');
  }, []);

  const finishSave = useCallback(() => {
    saveInProgress.current = false;
    setSaveState('success');
  }, []);

  useEffect(() => () => cancelAnimation(saveProgressRef.current), []);

  const handleConfirmAdd = useCallback(() => {
    if (saveInProgress.current) return;
    saveInProgress.current = true;
    setSaveError('');
    const candidate = selectedCandidate;
    try {
      addBook({
        title: candidate?.title ?? title.trim(),
        author: candidate?.authors.join(', ') || author.trim(),
        publisher: candidate?.publisher ?? (publisher.trim() || undefined),
        notes: notes.trim() || undefined,
        ownership: 'wishlist',
        coverUrl: candidate?.cover,
        customCoverUri: coverUri ?? undefined,
        isCustom: !candidate,
        source: candidate?.source ?? 'manual',
        coverSource: candidate?.source,
        description: candidate?.description,
        isbn: candidate?.isbn,
        publicationDate: candidate?.publicationDate,
        pageCount: candidate?.pageCount,
        externalId: candidate?.externalId,
        providerSource: candidate?.source,
      });
    } catch {
      saveInProgress.current = false;
      setSaveError('Your book could not be saved. Please try again.');
      setSaveState('error');
      return;
    }

    setSavedBook(previewBook);
    setSaveState('saving');
    if (reduceMotion) {
      // Reanimated shared values are intentionally mutated by the animation API.
      // eslint-disable-next-line react-hooks/immutability
      saveProgress.value = 1;
      finishSave();
    } else {
      saveProgress.value = 0;
      saveProgress.value = withTiming(
        1,
        { duration: 1450, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(finishSave)();
        },
      );
    }
  }, [selectedCandidate, title, author, publisher, notes, coverUri, addBook, previewBook, reduceMotion, saveProgress, finishSave]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <Screen>
          {saveState !== 'idle' ? (
            <SaveExperience
              phase={saveState}
              book={savedBook ?? previewBook}
              error={saveError}
              progress={saveProgress}
              onRetry={() => {
                setSaveState('idle');
                // eslint-disable-next-line react-hooks/immutability
                saveProgress.value = 0;
              }}
              onDone={() => router.back()}
            />
          ) : step === 'form' ? (
            <>
          {/* Back */}
          <PressableScale onPress={() => router.back()} style={styles.back} scaleTo={0.94}>
            <AppText variant="button" color="gold">
              ← Back
            </AppText>
          </PressableScale>

          {/* Heading */}
          <AppText variant="screenTitle" style={styles.heading}>
            Add a book
          </AppText>

          {/* ── Cover preview ── */}
          <View style={styles.coverRow}>
            <BookCover book={previewBook} width={96} height={142} />
            <View style={styles.coverActions}>
              <AppText variant="caption" color="muted" style={styles.coverHint}>
                Live preview of your cover
              </AppText>
              <PressableScale onPress={handlePickImage} style={styles.coverBtn} scaleTo={0.95}>
                <View style={styles.coverBtnInner}>
                  <AppText variant="meta" color="gold">
                    {coverUri ? 'Change image' : 'Pick cover image'}
                  </AppText>
                </View>
              </PressableScale>
              {coverUri ? (
                <PressableScale
                  onPress={handleRemoveCover}
                  style={styles.coverRemoveBtn}
                  scaleTo={0.95}>
                  <AppText variant="meta" color="muted">
                    Remove
                  </AppText>
                </PressableScale>
              ) : null}
            </View>
          </View>

          {/* ── About the book ── */}
          <SectionHeading title="About the book" style={styles.section} />

          <Field
            label="Title"
            required
            error={errors.title}
            placeholder="e.g. The Name of the Wind">
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. The Name of the Wind"
              placeholderTextColor={colors.text.muted}
              returnKeyType="next"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </Field>

          <Field label="Author" required error={errors.author} placeholder="e.g. Patrick Rothfuss">
            <TextInput
              style={[styles.input, errors.author ? styles.inputError : null]}
              value={author}
              onChangeText={(text) => {
                setAuthor(text);
                if (errors.author) setErrors((prev) => ({ ...prev, author: undefined }));
              }}
              placeholder="e.g. Patrick Rothfuss"
              placeholderTextColor={colors.text.muted}
              returnKeyType="next"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </Field>

          <Field label="Publisher" placeholder="e.g. DAW Books">
            <TextInput
              style={styles.input}
              value={publisher}
              onChangeText={setPublisher}
              placeholder="e.g. DAW Books"
              placeholderTextColor={colors.text.muted}
              returnKeyType="next"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </Field>

          {/* ── Personal note ── */}
          <SectionHeading title="Personal note" style={styles.section} />

          <Field label="Note" placeholder="Why did you add this book?">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Why did you add this book?"
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={4}
              returnKeyType="done"
              textAlignVertical="top"
            />
          </Field>

          {/* ── Submit ── */}
          <PressableScale onPress={handleSubmit} style={styles.submit} disabled={isSearching}>
            <View style={styles.submitInner}>
              {isSearching ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.text.inverse} />
                  <AppText variant="button" color="inverse">Searching…</AppText>
                </View>
              ) : (
                <AppText variant="button" color="inverse">Find matching editions</AppText>
              )}
            </View>
          </PressableScale>
            </>
          ) : step === 'results' ? (
            <>
              <PressableScale onPress={() => setStep('form')} style={styles.back} scaleTo={0.94}>
                <AppText variant="button" color="gold">← Edit details</AppText>
              </PressableScale>
              <AppText variant="screenTitle" style={styles.heading}>Choose an edition</AppText>
              <AppText variant="body" color="secondary" style={styles.supportingText}>
                Select the book that matches your copy. Nothing is added until you review it.
              </AppText>
              {candidates.length ? candidates.map((candidate, index) => (
                <CandidateCard
                  key={`${candidate.source}:${candidate.externalId}:${index}`}
                  candidate={candidate}
                  baseBook={formPreviewBook}
                  onSelect={() => handleSelectCandidate(candidate)}
                />
              )) : (
                <View style={styles.emptyState}>
                  <AppText variant="label">{searchFailed ? 'Book search is unavailable' : 'No useful matches found'}</AppText>
                  <AppText variant="caption" color="muted" style={styles.supportingText}>
                    Search may be unavailable. You can still add the details you entered manually.
                  </AppText>
                </View>
              )}
              <PressableScale onPress={handleManualCreation} style={styles.submit}>
                <View style={styles.secondaryButton}>
                  <AppText variant="button" color="gold">Create manually with my details</AppText>
                </View>
              </PressableScale>
            </>
          ) : (
            <>
              <PressableScale
                onPress={() => setStep(selectedCandidate ? 'results' : 'form')}
                style={styles.back}
                scaleTo={0.94}>
                <AppText variant="button" color="gold">← Back</AppText>
              </PressableScale>
              <AppText variant="screenTitle" style={styles.heading}>Review your book</AppText>
              <View style={styles.reviewCard}>
                <BookCover book={previewBook} width={106} height={158} />
                <View style={styles.reviewDetails}>
                  <AppText variant="label">{previewBook.title}</AppText>
                  <AppText variant="body" color="secondary">{previewBook.author}</AppText>
                  {previewBook.publisher ? <MetadataLine label="Publisher" value={previewBook.publisher} /> : null}
                  {previewBook.publicationDate ? <MetadataLine label="Published" value={previewBook.publicationDate} /> : null}
                  {previewBook.pageCount ? <MetadataLine label="Pages" value={String(previewBook.pageCount)} /> : null}
                  {previewBook.isbn ? <MetadataLine label="ISBN" value={previewBook.isbn} /> : null}
                  {previewBook.edition ? <MetadataLine label="Edition" value={previewBook.edition} /> : null}
                  {previewBook.description ? (
                    <AppText variant="caption" color="muted" numberOfLines={5} style={styles.description}>
                      {previewBook.description}
                    </AppText>
                  ) : null}
                  {selectedCandidate ? (
                    <AppText variant="caption" color="muted">Matched by {selectedCandidate.source === 'google-books' ? 'Google Books' : 'Open Library'}</AppText>
                  ) : (
                    <AppText variant="caption" color="gold">Using your entered details</AppText>
                  )}
                </View>
              </View>
              {duplicateBooks.length > 0 ? (
                <View style={styles.duplicateWarning}>
                  <AppText variant="meta" color="gold">
                    A matching title is already in your library. You can still add this edition.
                  </AppText>
                </View>
              ) : null}
              <PressableScale onPress={handleConfirmAdd} style={styles.submit}>
                <View style={styles.submitInner}>
                  <AppText variant="button" color="inverse">
                    Add to Wishlist
                  </AppText>
                </View>
              </PressableScale>
              {!selectedCandidate ? (
                <AppText variant="caption" color="muted" style={styles.manualNote}>
                  Manual entry keeps the title, author, publisher, note, and cover from your form.
                </AppText>
              ) : null}
            </>
          )}
        </Screen>
      </KeyboardAvoidingView>
    </>
  );
}

function SaveExperience({
  phase,
  book,
  error,
  progress,
  onRetry,
  onDone,
}: {
  phase: 'saving' | 'success' | 'error';
  book: Book;
  error: string;
  progress: SharedValue<number>;
  onRetry: () => void;
  onDone: () => void;
}) {
  const coverStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.08, 0.25, 1], [0, 1, 1, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 0.22, 0.8, 1], [-24, 0, 118, 124]) },
      { scale: interpolate(progress.value, [0, 0.22, 0.8, 1], [0.82, 1, 0.72, 0.7]) },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12, 0.3, 0.7, 1], [0, 0.15, 0.1, 0.12, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 0.3, 0.8, 1], [0.65, 1.08, 0.86, 0.55]) }],
  }));

  return (
    <View style={styles.saveExperience} accessibilityLiveRegion="polite">
      <View style={styles.saveStatus}>
        {phase === 'saving' ? <ActivityIndicator size="small" color={colors.gold[400]} /> : null}
        <AppText variant="meta" color={phase === 'error' ? 'danger' : 'gold'}>
          {phase === 'saving' ? 'Saving to your wishlist…' : phase === 'success' ? 'Saved' : 'Unable to save'}
        </AppText>
      </View>

      {phase === 'error' ? (
        <View style={styles.saveErrorPanel} accessibilityRole="alert">
          <AppText variant="label">The story is still waiting.</AppText>
          <AppText variant="body" color="secondary" style={styles.saveErrorText}>{error}</AppText>
          <PressableScale onPress={onRetry} style={styles.saveAction}>
            <View style={styles.submitInner}>
              <AppText variant="button" color="inverse">Try saving again</AppText>
            </View>
          </PressableScale>
        </View>
      ) : (
        <>
          <AppText variant="screenTitle" style={styles.saveTitle}>
            {phase === 'success' ? 'A place on the shelf' : 'Finding its place'}
          </AppText>
          <View style={styles.saveStage}>
            <Animated.View pointerEvents="none" style={[styles.saveGlow, glowStyle]} />
            <Animated.View style={[styles.flyingCover, coverStyle]}>
              <BookCover book={book} width={86} height={128} />
            </Animated.View>
            <View style={styles.bookshelf}>
              <View style={styles.shelfSpine} />
              <View style={styles.shelfBoard} />
              <View style={styles.shelfFoot} />
            </View>
          </View>
          {phase === 'success' ? (
            <>
              <AppText variant="label" style={styles.successMessage} accessibilityRole="text">
                A new story joins your wishlist.
              </AppText>
              <PressableScale onPress={onDone} style={styles.saveAction}>
                <View style={styles.submitInner}>
                  <AppText variant="button" color="inverse">Return to Wishlist</AppText>
                </View>
              </PressableScale>
            </>
          ) : (
            <AppText variant="caption" color="muted" style={styles.saveHint}>
              {book.title}
            </AppText>
          )}
        </>
      )}
    </View>
  );
}

function CandidateCard({
  candidate,
  baseBook,
  onSelect,
}: {
  candidate: BookSearchResult;
  baseBook: Book;
  onSelect: () => void;
}) {
  const coverBook: Book = {
    ...baseBook,
    title: candidate.title,
    author: candidate.authors.join(', ') || 'Unknown author',
    coverUrl: candidate.cover,
  };

  return (
    <PressableScale onPress={onSelect} style={styles.candidatePressable}>
      <View style={styles.candidateCard}>
        <BookCover book={coverBook} width={60} height={90} />
        <View style={styles.candidateDetails}>
          <AppText variant="label" numberOfLines={2}>{candidate.title}</AppText>
          <AppText variant="caption" color="secondary" numberOfLines={2}>
            {candidate.authors.join(', ') || 'Author not listed'}
          </AppText>
          {candidate.publisher ? <MetadataLine label="Publisher" value={candidate.publisher} /> : null}
          {candidate.publicationDate ? <MetadataLine label="Published" value={candidate.publicationDate} /> : null}
          {candidate.pageCount ? <MetadataLine label="Pages" value={String(candidate.pageCount)} /> : null}
          {candidate.isbn ? <MetadataLine label="ISBN" value={candidate.isbn} /> : null}
          <AppText variant="caption" color="muted">
            {candidate.source === 'google-books' ? 'Google Books' : 'Open Library'}
          </AppText>
        </View>
        <AppText variant="button" color="gold">›</AppText>
      </View>
    </PressableScale>
  );
}

function MetadataLine({ label, value }: { label: string; value: string }) {
  return (
    <AppText variant="caption" color="muted" numberOfLines={1}>
      {label}: {value}
    </AppText>
  );
}

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <AppText variant="meta" color={error ? 'danger' : 'secondary'}>
          {label}
        </AppText>
        {required ? (
          <AppText variant="meta" color="gold">
            {' '}
            *
          </AppText>
        ) : null}
      </View>
      {children}
      {error ? (
        <AppText variant="caption" color="danger" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  back: {
    width: 72,
    marginBottom: spacing.xl,
  },
  heading: {
    marginBottom: spacing.xxl,
  },

  // Cover
  coverRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
    marginBottom: spacing.xxxl,
  },
  coverActions: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  coverHint: {
    marginBottom: spacing.xs,
  },
  coverBtn: {
    alignSelf: 'flex-start',
  },
  coverBtnInner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line.soft,
    backgroundColor: colors.background.raised,
  },
  coverRemoveBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },

  // Section spacing
  section: {
    marginTop: spacing.lg,
  },

  // Field
  fieldWrapper: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.raised,
    borderWidth: 1,
    borderColor: colors.line.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  inputError: {
    borderColor: colors.state.danger,
  },
  textarea: {
    minHeight: 96,
    paddingTop: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
  },

  // Submit
  submit: {
    marginBottom: spacing.xl,
  },
  submitInner: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.gold[400],
  },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  supportingText: {
    marginBottom: spacing.lg,
  },
  emptyState: {
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line.hairline,
    backgroundColor: colors.background.raised,
    marginBottom: spacing.lg,
  },
  candidatePressable: {
    marginBottom: spacing.md,
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line.hairline,
    backgroundColor: colors.background.raised,
  },
  candidateDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line.hairline,
    backgroundColor: colors.background.raised,
  },
  reviewDetails: {
    flex: 1,
    gap: spacing.sm,
  },
  description: {
    marginTop: spacing.xs,
  },
  duplicateWarning: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line.soft,
    backgroundColor: colors.background.raised,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line.strong,
    backgroundColor: colors.background.raised,
  },
  manualNote: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  saveExperience: {
    minHeight: 550,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  saveStatus: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line.soft,
    backgroundColor: colors.background.raised,
  },
  saveTitle: {
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  saveStage: {
    width: '100%',
    height: 330,
    alignItems: 'center',
    position: 'relative',
  },
  saveGlow: {
    position: 'absolute',
    top: 26,
    width: 180,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.gold[400],
  },
  flyingCover: {
    position: 'absolute',
    top: 22,
    zIndex: 2,
    shadowColor: colors.gold[400],
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  bookshelf: {
    position: 'absolute',
    top: 188,
    width: 230,
    height: 82,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.line.strong,
    backgroundColor: colors.background.raised,
    opacity: 0.9,
  },
  shelfSpine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 16,
    width: 2,
    backgroundColor: colors.line.soft,
  },
  shelfBoard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 17,
    height: 2,
    backgroundColor: colors.line.soft,
  },
  shelfFoot: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: -8,
    height: 6,
    borderRadius: radius.xs,
    backgroundColor: colors.line.strong,
  },
  successMessage: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  saveHint: {
    marginTop: -spacing.xl,
    textAlign: 'center',
  },
  saveAction: {
    width: '100%',
    marginTop: spacing.md,
  },
  saveErrorPanel: {
    width: '100%',
    marginTop: spacing.xxxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line.soft,
    borderRadius: radius.md,
    backgroundColor: colors.background.raised,
  },
  saveErrorText: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
