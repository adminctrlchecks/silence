import { submitResponsesSchema } from '@silence/shared';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { publicApi, ApiError } from '@/lib/api';
import { USER_TOKEN_COOKIE } from '@/lib/auth-routing';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Sign in is required to save responses' } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = submitResponsesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid response details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await publicApi.submitResponses(parsed.data, token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: 'SAVE_RESPONSES_FAILED', message: 'Unable to save responses' } },
      { status: 500 },
    );
  }
}
