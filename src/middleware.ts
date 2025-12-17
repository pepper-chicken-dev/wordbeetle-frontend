import { auth } from '@/features/auth/lib/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (
    session?.user !== null &&
    session?.user !== undefined &&
    request.nextUrl.pathname === '/auth'
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth'],
};
