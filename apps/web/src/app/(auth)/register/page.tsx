import { cookies } from 'next/headers';
import { AuthCard } from '@/components/auth/auth-card';
import {
  CATEGORY_COOKIE,
  LANGUAGE_COOKIE,
  categoryOrDefault,
  normalizeSessionLanguage,
} from '@/lib/session-preferences';

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const language = normalizeSessionLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const category = categoryOrDefault(cookieStore.get(CATEGORY_COOKIE)?.value);

  return <AuthCard mode="register" initialLanguage={language} initialCategory={category} />;
}
