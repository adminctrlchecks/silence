import { CATEGORIES, LEVELS, type Category, type Level } from '@silence/shared';
import { NextResponse } from 'next/server';
import { publicApi, ApiError } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const questionId = url.searchParams.get('questionId') ?? '';
  const level = url.searchParams.get('level') ?? '';
  const category = url.searchParams.get('category') ?? '';
  const lang = normalizeSessionLanguage(url.searchParams.get('lang'));

  if (!questionId || !LEVELS.includes(level as Level) || !CATEGORIES.includes(category as Category)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid answer query' } },
      { status: 400 },
    );
  }

  try {
    const answer = await publicApi.answer({
      questionId,
      level: level as Level,
      category: category as Category,
      lang,
    });
    return NextResponse.json(answer);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: 'ANSWER_FETCH_FAILED', message: 'Unable to load answer' } },
      { status: 500 },
    );
  }
}
