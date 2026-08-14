import { NextResponse } from 'next/server';
import { adminApi, ApiError } from '@/lib/api';
import { getAdminToken } from '@/lib/admin-session';

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
    { error: { code: 'USER_SESSIONS_FETCH_FAILED', message: 'Unable to load reading sessions' } },
    { status: 500 },
  );
}

export async function GET(request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const { id } = await context.params;
  const url = new URL(request.url);

  try {
    const sessions = await adminApi.listUserSessions(token, id, {
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return apiError(error);
  }
}
