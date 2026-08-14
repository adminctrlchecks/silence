import { CATEGORIES, createRemedySchema, type Category } from '@silence/shared';
import { NextResponse } from 'next/server';
import { adminApi, ApiError } from '@/lib/api';
import { getAdminToken } from '@/lib/admin-session';

function unauthorized() {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Admin sign in is required' } },
    { status: 401 },
  );
}

function apiError(error: unknown, fallbackCode: string, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  return NextResponse.json(
    { error: { code: fallbackCode, message: fallbackMessage } },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? undefined;
  const q = url.searchParams.get('q')?.trim() || undefined;

  if (category && !CATEGORIES.includes(category as Category)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid remedy category' } },
      { status: 400 },
    );
  }

  try {
    const remedies = await adminApi.listRemedies(token, {
      category,
      q,
      page: url.searchParams.get('page') ?? 1,
      limit: url.searchParams.get('limit') ?? 100,
    });
    return NextResponse.json(remedies);
  } catch (error) {
    return apiError(error, 'REMEDIES_FETCH_FAILED', 'Unable to load remedies');
  }
}

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createRemedySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid remedy details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const remedy = await adminApi.createRemedy(token, parsed.data);
    return NextResponse.json(remedy);
  } catch (error) {
    return apiError(error, 'REMEDY_CREATE_FAILED', 'Unable to create remedy');
  }
}
