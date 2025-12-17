'use server';

import { providerMap, signIn } from '@/features/auth/lib/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

type ProviderId = (typeof providerMap)[number]['id'];

const SIGNIN_ERROR_URL = '/auth?error';

export async function signInAction(formData: FormData) {
  const providerId = formData.get('providerId');

  if (typeof providerId !== 'string') {
    throw new Error('providerId must be a string');
  }

  const VALID_PROVIDERS: ProviderId[] = ['google', 'github'];
  if (!VALID_PROVIDERS.includes(providerId as ProviderId)) {
    throw new Error(`Invalid provider: ${providerId}`);
  }

  try {
    await signIn(providerId as ProviderId, {
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`${SIGNIN_ERROR_URL}=${error.type}`);
    }
    throw error;
  }
}
