import {
  ANSWER_SOURCES,
  CATEGORIES,
  LEVELS,
  createAnswerSchema,
  type AnswerSource,
  type Category,
  type Level,
} from '@silence/shared';
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
  const source = url.searchParams.get('source') ?? undefined;
  const reviewed = url.searchParams.get('reviewed') ?? undefined;
  const q = url.searchParams.get('q')?.trim() || undefined;

  if (level && !LEVELS.includes(level as Level)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid answer level' } },
      { status: 400 },
    );
  }

  if (category && !CATEGORIES.includes(category as Category)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid answer category' } },
      { status: 400 },
    );
  }

  if (source && !ANSWER_SOURCES.includes(source as AnswerSource)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid answer source' } },
      { status: 400 },
    );
  }

  if (reviewed && reviewed !== 'true' && reviewed !== 'false') {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid reviewed filter' } },
      { status: 400 },
    );
  }

  try {
    const answers = await adminApi.listAnswers(token, {
      level,
      category,
      q,
      source,
      reviewed,
      questionId: url.searchParams.get('questionId') ?? undefined,
      page: url.searchParams.get('page') ?? 1,
      limit: url.searchParams.get('limit') ?? 100,
    });
    return NextResponse.json(answers);
  } catch (error) {
    return apiError(error, 'ANSWERS_FETCH_FAILED', 'Unable to load answers');
  }
}

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createAnswerSchema.safeParse(body);

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
    const answer = await adminApi.createAnswer(token, parsed.data);
    return NextResponse.json(answer);
  } catch (error) {
    return apiError(error, 'ANSWER_CREATE_FAILED', 'Unable to create answer');
  }
}
