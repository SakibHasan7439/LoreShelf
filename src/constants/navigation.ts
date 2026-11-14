import type { LucideIcon } from 'lucide-react-native';
import { Bookmark, BookOpen, House, Library, UserRound } from 'lucide-react-native';

import type { Shelf } from '@/types/shelf';

export interface TabDefinition {
  name: string;
  title: string;
  icon: LucideIcon;
}

/** Tab order and labels used by the custom bottom navigation. */
export const tabs: readonly TabDefinition[] = [
  { name: 'index', title: 'Home', icon: House },
  { name: 'wishlist', title: 'Wishlist', icon: Bookmark },
  { name: 'collection', title: 'Collection', icon: Library },
  { name: 'reading', title: 'Reading', icon: BookOpen },
  { name: 'profile', title: 'Profile', icon: UserRound },
];

export const shelves: readonly Shelf[] = [
  {
    id: 'fantasy',
    name: 'Fantasy',
    tagline: 'Maps & magic',
    glyph: 'castle',
    tint: ['#22352A', '#121B15'],
  },
  {
    id: 'fiction',
    name: 'Fiction',
    tagline: 'Lives imagined',
    glyph: 'feather',
    tint: ['#2B2A22', '#151510'],
  },
  {
    id: 'history',
    name: 'History',
    tagline: 'Ages past',
    glyph: 'landmark',
    tint: ['#2C2721', '#16120E'],
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    tagline: 'Questions that linger',
    glyph: 'scroll',
    tint: ['#232C2A', '#111715'],
  },
  {
    id: 'science',
    name: 'Science',
    tagline: 'Worlds explained',
    glyph: 'flask',
    tint: ['#202A31', '#10161A'],
  },
  {
    id: 'favorites',
    name: 'Favorites',
    tagline: 'Shelf of honour',
    glyph: 'star',
    tint: ['#33291B', '#18130C'],
  },
];
