import { userRegisterSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { authApi, ApiError } from '@/lib/api';
import { USER_TOKEN_COOKIE } from '@/lib/auth-routing';
import { CATEGORY_COOKIE, LANGUAGE_COOKIE } from '@/lib/session-preferences';

const USER_REFRESH_COOKIE = 'silence_user_refresh_token';
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = userRegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid registration details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await authApi.userRegister(parsed.data);
    const response = NextResponse.json({ user: result.user });

    response.cookies.set(USER_TOKEN_COOKIE, result.token, cookieOptions(accessMaxAge));
    response.cookies.set(USER_REFRESH_COOKIE, result.refreshToken, cookieOptions(refreshMaxAge));
    response.cookies.set(LANGUAGE_COOKIE, parsed.data.lang, cookieOptions(refreshMaxAge, false));
    response.cookies.set(CATEGORY_COOKIE, parsed.data.category, cookieOptions(refreshMaxAge, false));

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: 'REGISTER_FAILED', message: 'Registration failed' } },
      { status: 500 },
    );
  }
}
