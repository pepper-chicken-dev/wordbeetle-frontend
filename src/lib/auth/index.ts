import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import { createGuestUser } from '@/data/guest-user';
import { getAuthJsProviders } from './providers';

const oauthProviders: Provider[] = getAuthJsProviders();

const guestProvider = Credentials({
  id: 'guest',
  name: 'Guest',
  credentials: {},
  async authorize() {
    const guest = await createGuestUser();

    return {
      name: guest.name,
      idToken: guest.token,
    };
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [...oauthProviders, guestProvider],
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
          idToken?: string;
        };
        token.idToken = guestUser.idToken;
        return token;
      }

      const idToken = account?.id_token;

      if (idToken === undefined) {
        return token;
      }

      token.idToken = idToken;

      if (trigger === 'signIn') {
        const apiUrl = process.env.API_URL;

        if (apiUrl === undefined) {
          throw new Error('API_URL is not configured');
        }

        try {
          const response = await fetch(`${apiUrl}/auth/google`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!response.ok) {
            console.error(
              'API authentication failed:',
              response.status,
              response.statusText,
            );
            throw new Error(`Authentication failed: ${response.status}`);
          }
        } catch (error) {
          console.error('API connection error:', error);
          throw error;
        }
      }

      return token;
    },
    session({ session, token }) {
      session.user.idToken = token.idToken;

      return session;
    },
  },
});
