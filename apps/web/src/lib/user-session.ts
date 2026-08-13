import { cookies } from 'next/headers';
import { USER_TOKEN_COOKIE } from '@/lib/auth-routing';

function decodeUserId(token: string) {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: string };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_TOKEN_COOKIE)?.value;
  const userId = token ? decodeUserId(token) : null;

  return token && userId ? { token, userId } : null;
}
