import { autoTranslateSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { adminApi, ApiError } from '@/lib/api';
import { getAdminToken } from '@/lib/admin-session';

export async function POST(request: Request) {
  const token = await getAdminToken();

  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin sign in is required' } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = autoTranslateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid translation details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await adminApi.autoTranslate(token, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: 'AUTO_TRANSLATE_FAILED', message: 'Unable to auto-translate content' } },
      { status: 500 },
    );
  }
}
