import { adminLoginSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { ApiError, authApi } from '@/lib/api';
import { setAdminAuthCookies } from '@/lib/auth-cookies';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid admin login details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await authApi.adminLogin(parsed.data);
    const response = NextResponse.json({ admin: result.admin });

    setAdminAuthCookies(response, result);

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: 'LOGIN_FAILED', message: 'Admin login failed' } },
      { status: 500 },
    );
  }
}
