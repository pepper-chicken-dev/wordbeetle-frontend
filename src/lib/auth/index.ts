import NextAuth from 'next-auth';
import type { AuthResponse } from '@/types/dto';
import { appProviders } from './app-providers';
import { getAndClearGuestTokenCookie } from './guest-migration';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: appProviders.map((p) => p.provider),
  pages: {
    signIn: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, trigger, user }) {
      if (trigger === 'signIn' && account?.provider === 'guest') {
        const guestUser = user as {
          accessToken?: string;
        };
        token.accessToken = guestUser.accessToken;
        token.isGuest = true;
        return token;
      }

      if (trigger === 'signIn' && account?.provider === 'google') {
        const googleIdToken = account.id_token;

        if (googleIdToken === undefined) {
          throw new Error('Google ID token is missing');
        }

        const apiUrl = process.env.API_URL;

        if (apiUrl === undefined) {
          throw new Error('API_URL is not configured');
        }

        const guestToken = await getAndClearGuestTokenCookie();

        try {
          const response = await fetch(`${apiUrl}/auth/google`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${googleIdToken}`,
              ...(guestToken !== undefined
                ? { 'Content-Type': 'application/json' }
                : {}),
            },
            ...(guestToken !== undefined
              ? { body: JSON.stringify({ guest_token: guestToken }) }
              : {}),
          });

          if (!response.ok) {
            console.error(
              'API authentication failed:',
              response.status,
              response.statusText,
            );
            throw new Error(`Authentication failed: ${response.status}`);
          }

          const result = (await response.json()) as AuthResponse;
          token.accessToken = result.token;
          token.isGuest = false;
        } catch (error) {
          console.error('API connection error:', error);
          throw error;
        }
      }

      return token;
    },
    session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.isGuest = token.isGuest ?? false;

      return session;
    },
  },
});
