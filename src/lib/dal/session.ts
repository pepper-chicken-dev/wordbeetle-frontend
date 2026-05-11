import 'server-only';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export type VerifiedSession = {
  accessToken: string;
  isGuest: boolean;
};

export const verifySession = cache(async (): Promise<VerifiedSession> => {
  const session = await auth();
  const token = session?.user?.accessToken;

  if (token === undefined || token === null) {
    redirect('/auth');
  }

  return {
    accessToken: token,
    isGuest: session?.user?.isGuest === true,
  };
});
