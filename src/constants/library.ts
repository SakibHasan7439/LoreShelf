import {
  Bookmark,
  BookOpen,
  Camera,
  CircleCheck,
  CirclePause,
  Globe,
  Play,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react-native';

import { colors } from '@/theme';

import type { BookPriority, DiscoverySource, ReadingStatus } from '@/types/book';

interface StatusMeta {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const readingStatusOrder: readonly ReadingStatus[] = [
  'want-to-read',
  'reading',
  'completed',
  'on-hold',
];

export const readingStatusMeta: Record<ReadingStatus, StatusMeta> = {
  'want-to-read': { label: 'Want to read', color: colors.text.secondary, icon: Bookmark },
  reading: { label: 'Reading', color: colors.gold[300], icon: BookOpen },
  completed: { label: 'Completed', color: colors.emerald[200], icon: CircleCheck },
  'on-hold': { label: 'On hold', color: colors.state.warning, icon: CirclePause },
};

export const priorityMeta: Record<BookPriority, { label: string; color: string }> = {
  high: { label: 'High priority', color: colors.gold[300] },
  medium: { label: 'Medium priority', color: colors.emerald[200] },
  low: { label: 'Low priority', color: colors.text.muted },
};

export const discoverySourceMeta: Record<DiscoverySource, { label: string; icon: LucideIcon }> = {
  facebook: { label: 'Facebook', icon: Globe },
  instagram: { label: 'Instagram', icon: Camera },
  youtube: { label: 'YouTube', icon: Play },
  friend: { label: 'A friend', icon: Users },
  other: { label: 'Somewhere else', icon: Sparkles },
};

export const discoverySourceOrder: readonly DiscoverySource[] = [
  'instagram',
  'facebook',
  'youtube',
  'friend',
  'other',
];
