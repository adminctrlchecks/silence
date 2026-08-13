import type { NextResponse } from 'next/server';
import type { Category } from '@silence/shared';
import { ADMIN_TOKEN_COOKIE, USER_TOKEN_COOKIE } from '@/lib/auth-routing';
import { CATEGORY_COOKIE, LANGUAGE_COOKIE } from '@/lib/session-preferences';

export const USER_REFRESH_COOKIE = 'silence_user_refresh_token';
export const ADMIN_REFRESH_COOKIE = 'silence_admin_refresh_token';

const accessMaxAge = 60 * 60 * 24 * 7;
const refreshMaxAge = 60 * 60 * 24 * 30;

function cookieOptions(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export function setUserAuthCookies(
  response: NextResponse,
  auth: { token: string; refreshToken: string },
  preferences: { lang?: string; category?: Category } = {},
) {
  response.cookies.set(USER_TOKEN_COOKIE, auth.token, cookieOptions(accessMaxAge));
  response.cookies.set(USER_REFRESH_COOKIE, auth.refreshToken, cookieOptions(refreshMaxAge));

  if (preferences.lang) {
    response.cookies.set(LANGUAGE_COOKIE, preferences.lang, cookieOptions(refreshMaxAge, false));
  }

  if (preferences.category) {
    response.cookies.set(CATEGORY_COOKIE, preferences.category, cookieOptions(refreshMaxAge, false));
  }
}

export function setAdminAuthCookies(
  response: NextResponse,
  auth: { token: string; refreshToken: string },
) {
  response.cookies.set(ADMIN_TOKEN_COOKIE, auth.token, cookieOptions(accessMaxAge));
  response.cookies.set(ADMIN_REFRESH_COOKIE, auth.refreshToken, cookieOptions(refreshMaxAge));
}
