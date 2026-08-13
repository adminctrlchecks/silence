import { CATEGORIES, LEVELS, createQuestionSchema, type Category, type Level } from '@silence/shared';
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
  const level = url.searchParams.get('level') ?? undefined;
  const category = url.searchParams.get('category') ?? undefined;

  if (level && !LEVELS.includes(level as Level)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid question level' } },
      { status: 400 },
    );
  }

  if (category && !CATEGORIES.includes(category as Category)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid question category' } },
      { status: 400 },
    );
  }

  try {
    const questions = await adminApi.listQuestions(token, {
      level,
      category,
      page: url.searchParams.get('page') ?? 1,
      limit: url.searchParams.get('limit') ?? 100,
    });
    return NextResponse.json(questions);
  } catch (error) {
    return apiError(error, 'QUESTIONS_FETCH_FAILED', 'Unable to load questions');
  }
}

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createQuestionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid question details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const question = await adminApi.createQuestion(token, parsed.data);
    return NextResponse.json(question);
  } catch (error) {
    return apiError(error, 'QUESTION_CREATE_FAILED', 'Unable to create question');
  }
}
