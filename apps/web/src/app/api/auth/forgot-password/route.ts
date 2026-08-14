import { userForgotPasswordSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { ApiError, authApi } from '@/lib/api';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = userForgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid request' } },
      { status: 400 },
    );
  }

  try {
    const result = await authApi.userForgotPassword(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: { code: 'FORGOT_PASSWORD_FAILED', message: 'Unable to process the request' } },
      { status: 500 },
    );
  }
}
