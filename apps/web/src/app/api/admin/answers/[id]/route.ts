import { updateAnswerSchema } from '@silence/shared';
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

export async function PUT(request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateAnswerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid answer details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const answer = await adminApi.updateAnswer(token, id, parsed.data);
    return NextResponse.json(answer);
  } catch (error) {
    return apiError(error, 'ANSWER_UPDATE_FAILED', 'Unable to update answer');
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const { id } = await context.params;

  try {
    const result = await adminApi.deleteAnswer(token, id);
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, 'ANSWER_DELETE_FAILED', 'Unable to delete answer');
  }
}
