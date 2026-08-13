import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth-routing';

export async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
}
