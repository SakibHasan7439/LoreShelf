import { Redirect, type Href } from 'expo-router';

import { useAuthStore } from '@/store/auth';

export default function IndexRoute() {
  const authenticated = useAuthStore((state) => state.status === 'authenticated');
  const href = authenticated ? '/(tabs)' : '/login';
  return <Redirect href={href as Href} />;
}
