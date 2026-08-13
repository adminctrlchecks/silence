import { IMPORT_TYPES, type ImportType } from '@silence/shared';
import { NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/admin-session';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3010/api/v1';

export async function GET(request: Request) {
  const token = await getAdminToken();

  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin sign in is required' } },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? '';

  if (!IMPORT_TYPES.includes(type as ImportType)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid import type' } },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${API_BASE_URL}/admin/import/template?type=${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: { code: 'TEMPLATE_DOWNLOAD_FAILED', message: 'Unable to download template' } },
      { status: upstream.status },
    );
  }

  return new Response(await upstream.arrayBuffer(), {
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ??
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        upstream.headers.get('content-disposition') ??
        `attachment; filename="${type}-template.xlsx"`,
    },
  });
}
