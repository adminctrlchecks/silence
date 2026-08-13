import { CATEGORIES, chartConfigSchema, type Category } from '@silence/shared';
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
  const category = url.searchParams.get('category') ?? '';

  if (!CATEGORIES.includes(category as Category)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid chart category' } },
      { status: 400 },
    );
  }

  try {
    const config = await adminApi.chartConfig(token, category as Category);
    return NextResponse.json(config);
  } catch (error) {
    return apiError(error, 'CHART_CONFIG_FETCH_FAILED', 'Unable to load chart config');
  }
}

export async function PUT(request: Request) {
  const token = await getAdminToken();
  if (!token) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = chartConfigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid chart config details',
        },
      },
      { status: 400 },
    );
  }

  try {
    const config = await adminApi.updateChartConfig(token, parsed.data);
    return NextResponse.json(config);
  } catch (error) {
    return apiError(error, 'CHART_CONFIG_UPDATE_FAILED', 'Unable to update chart config');
  }
}
