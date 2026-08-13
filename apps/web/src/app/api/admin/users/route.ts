import { NextResponse } from 'next/server';
import { adminApi, ApiError } from '@/lib/api';
import { getAdminToken } from '@/lib/admin-session';

function unauthorized() {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Admin sign in is required' } },
    { status: 401 },
  );
}

function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  return NextResponse.json(
    { error: { code: 'USERS_FETCH_FAILED', message: 'Unable to load users' } },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const url = new URL(request.url);

  try {
    const users = await adminApi.listUsers(token, {
      page: url.searchParams.get('page') ?? 1,
      limit: url.searchParams.get('limit') ?? 50,
    });
    return NextResponse.json(users);
  } catch (error) {
    return apiError(error);
  }
}
