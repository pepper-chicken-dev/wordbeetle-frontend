'use server';

import { signIn } from '@/lib/auth';
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
