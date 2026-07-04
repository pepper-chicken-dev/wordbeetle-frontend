import 'server-only';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'guest_migration_token';

export async function setGuestTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
}

export async function getAndClearGuestTokenCookie(): Promise<
  string | undefined
> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (cookie === undefined) {
    return undefined;
  }

  cookieStore.delete(COOKIE_NAME);
  return cookie.value;
}
