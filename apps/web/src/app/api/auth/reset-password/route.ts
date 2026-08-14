import { resetPasswordSchema } from '@silence/shared';
import { NextResponse } from 'next/server';
import { ApiError, authApi } from '@/lib/api';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid request' } },
      { status: 400 },
    );
  }

  try {
    const result = await authApi.userResetPassword(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: { code: 'RESET_PASSWORD_FAILED', message: 'Unable to reset password' } },
      { status: 500 },
    );
  }
}
