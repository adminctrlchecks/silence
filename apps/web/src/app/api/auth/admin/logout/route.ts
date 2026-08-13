import { NextResponse } from 'next/server';
import { clearAdminAuthCookies } from '@/lib/auth-cookies';

export async function POST() {
  const response = NextResponse.json({ signedOut: true });
  clearAdminAuthCookies(response);
  return response;
}
