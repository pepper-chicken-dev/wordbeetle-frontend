'use server';

import { signIn } from '@/features/auth/lib/auth';
import { getProviderIds } from '@/features/auth/lib/providers';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

const SIGNIN_ERROR_URL = '/auth?error';

export async function signInAction(formData: FormData) {
  const providerId = formData.get('providerId');

  if (typeof providerId !== 'string') {
    throw new Error('providerId must be a string');
  }

  if (!getProviderIds().includes(providerId)) {
    throw new Error(`Invalid provider: ${providerId}`);
  }

  try {
    await signIn(providerId, {
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`${SIGNIN_ERROR_URL}=${error.type}`);
    }
    throw error;
  }
}
