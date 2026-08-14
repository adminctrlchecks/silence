import { cookies } from 'next/headers';
import { USER_TOKEN_COOKIE } from '@/lib/auth-routing';

function decodeUserToken(token: string): { userId: string | null; isAdminSession: boolean } {
  const payload = token.split('.')[1];
  if (!payload) return { userId: null, isAdminSession: false };

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      isAdminSession?: boolean;
    };
    return { userId: decoded.sub ?? null, isAdminSession: decoded.isAdminSession === true };
  } catch {
    return { userId: null, isAdminSession: false };
  }
}

export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_TOKEN_COOKIE)?.value;
  if (!token) return null;

  const { userId, isAdminSession } = decodeUserToken(token);
  return userId ? { token, userId, isAdminSession } : null;
}
