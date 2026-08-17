import { googleAuthSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { authApi, ApiError } from '@/lib/api';
import { setUserAuthCookies } from '@/lib/auth-cookies';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = googleAuthSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid Google sign-in request',
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await authApi.userGoogleAuth(parsed.data);
    const response = NextResponse.json({ user: result.user, profileComplete: result.profileComplete });

    setUserAuthCookies(response, result, { category: result.user.category });

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: 'GOOGLE_SIGN_IN_FAILED', message: 'Google sign-in failed' } },
      { status: 500 },
    );
  }
}
