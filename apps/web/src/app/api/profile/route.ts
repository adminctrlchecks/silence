import { updateUserProfileSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { ApiError, publicApi } from '@/lib/api';
import { getUserSession } from '@/lib/user-session';

function unauthorized() {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Sign in is required' } },
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
    { error: { code: 'PROFILE_SAVE_FAILED', message: 'Unable to save profile' } },
    { status: 500 },
  );
}

export async function GET() {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const profile = await publicApi.profile(session.userId, session.token);
    return NextResponse.json(profile);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = updateUserProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid profile details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const profile = await publicApi.updateProfile(session.userId, session.token, parsed.data);
    return NextResponse.json(profile);
  } catch (error) {
    return apiError(error);
  }
}
