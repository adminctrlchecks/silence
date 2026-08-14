import { NextResponse } from 'next/server';
import { ApiError, publicApi } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    const results = await publicApi.placesSearch(q);
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: { code: 'PLACE_SEARCH_FAILED', message: 'Unable to search places' } },
      { status: 500 },
    );
  }
}
