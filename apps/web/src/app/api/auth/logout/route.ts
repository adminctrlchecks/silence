import { NextResponse } from 'next/server';
import { clearUserAuthCookies } from '@/lib/auth-cookies';

export async function POST() {
  const response = NextResponse.json({ signedOut: true });
  clearUserAuthCookies(response);
  return response;
}
