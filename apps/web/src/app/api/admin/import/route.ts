import { IMPORT_TYPES, type ImportType } from '@silence/shared';
import { NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/admin-session';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3010/api/v1';

export async function POST(request: Request) {
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

  const incoming = await request.formData().catch(() => null);
  const file = incoming?.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Upload an .xlsx file' } },
      { status: 400 },
    );
  }

  const form = new FormData();
  form.set('file', file);

  const upstream = await fetch(`${API_BASE_URL}/admin/import?type=${type}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(
      data ?? { error: { code: 'IMPORT_UPLOAD_FAILED', message: 'Unable to upload import file' } },
      { status: upstream.status },
    );
  }

  return NextResponse.json(data);
}
