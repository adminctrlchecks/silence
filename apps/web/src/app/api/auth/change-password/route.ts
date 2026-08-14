import { changePasswordSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { ApiError, authApi } from '@/lib/api';
import { clearUserAuthCookies } from '@/lib/auth-cookies';
import { getUserSession } from '@/lib/user-session';

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  return NextResponse.json(
    { error: { code: 'PASSWORD_CHANGE_FAILED', message: 'Unable to change password' } },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Sign in is required' } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid password details',
        },
      },
      { status: 400 },
    );
  }

  try {
    await authApi.userChangePassword(session.token, parsed.data);
    const response = NextResponse.json({ changed: true, signedOut: true });
    clearUserAuthCookies(response);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
