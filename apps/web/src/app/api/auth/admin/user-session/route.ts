import { NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/admin-session';
import { ApiError, authApi } from '@/lib/api';
import { setUserAuthCookies } from '@/lib/auth-cookies';

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  return NextResponse.json(
    { error: { code: 'USER_SESSION_FAILED', message: 'Unable to open the user app' } },
    { status: 500 },
  );
}

export async function POST() {
  const token = await getAdminToken();
  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin sign in is required' } },
      { status: 401 },
    );
  }

  try {
    const result = await authApi.adminUserSession(token);
    const response = NextResponse.json({ user: result.user });
    setUserAuthCookies(response, result, { category: result.user.category });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
