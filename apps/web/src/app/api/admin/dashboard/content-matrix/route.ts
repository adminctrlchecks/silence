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
    { error: { code: 'CONTENT_MATRIX_FETCH_FAILED', message: 'Unable to load content matrix' } },
    { status: 500 },
  );
}

export async function GET() {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  try {
    const matrix = await adminApi.contentMatrix(token);
    return NextResponse.json(matrix);
  } catch (error) {
    return apiError(error);
  }
}
