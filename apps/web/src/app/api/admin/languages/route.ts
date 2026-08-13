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

export async function GET() {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  try {
    const languages = await adminApi.languages(token);
    return NextResponse.json(languages);
  } catch (error) {
    return apiError(error, 'LANGUAGES_FETCH_FAILED', 'Unable to load languages');
  }
}

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
    name?: unknown;
    rtl?: unknown;
  } | null;
  const code = typeof body?.code === 'string' ? body.code.trim().toLowerCase() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const rtl = body?.rtl === true;

  if (!/^[a-z]{2,8}(-[a-z]{2,8})?$/.test(code) || !name) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid language details' } },
      { status: 400 },
    );
  }

  try {
    const language = await adminApi.addLanguage(token, { code, name, rtl });
    return NextResponse.json(language);
  } catch (error) {
    return apiError(error, 'LANGUAGE_SAVE_FAILED', 'Unable to save language');
  }
}
