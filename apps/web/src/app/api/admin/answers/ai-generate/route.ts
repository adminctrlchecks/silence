import { aiGenerateAnswerSchema } from '@silence/shared';
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
  const parsed = aiGenerateAnswerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid AI generation details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const answer = await adminApi.aiGenerate(token, parsed.data);
    return NextResponse.json(answer);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: 'AI_GENERATE_FAILED', message: 'Unable to generate answer' } },
      { status: 500 },
    );
  }
}
