import { changePasswordSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/admin-session';
import { ApiError, authApi } from '@/lib/api';
import { clearAdminAuthCookies } from '@/lib/auth-cookies';

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
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin sign in is required' } },
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
    await authApi.adminChangePassword(token, parsed.data);
    const response = NextResponse.json({ changed: true, signedOut: true });
    clearAdminAuthCookies(response);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
