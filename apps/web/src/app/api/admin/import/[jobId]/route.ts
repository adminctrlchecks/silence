import { NextResponse } from 'next/server';
import { adminApi, ApiError } from '@/lib/api';
import { getAdminToken } from '@/lib/admin-session';

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const token = await getAdminToken();

  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin sign in is required' } },
      { status: 401 },
    );
  }

  const { jobId } = await context.params;

  try {
    const status = await adminApi.importStatus(token, jobId);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: 'IMPORT_STATUS_FAILED', message: 'Unable to load import status' } },
      { status: 500 },
    );
  }
}
