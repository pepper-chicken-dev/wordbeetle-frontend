'use server';

import { auth, signIn } from '@/lib/auth';
import { setGuestTokenCookie } from '@/lib/auth/guest-migration';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export async function signInAsGuestAction() {
  try {
    await signIn('guest', {
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`/auth?error=${error.type}`);
    }
    throw error;
  }
}

export async function migrateGuestToGoogleAction() {
  const session = await auth();

  if (session?.user?.isGuest !== true) {
    throw new Error('Only guest users can migrate');
  }

  const accessToken = session.user.accessToken;

  if (accessToken === undefined) {
    throw new Error('Guest access token is missing');
  }

  await setGuestTokenCookie(accessToken);

  try {
    await signIn('google', {
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`/auth?error=${error.type}`);
    }
    throw error;
  }
}
