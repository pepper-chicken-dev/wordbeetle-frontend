import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import { getAuthJsProviders } from './providers';

const providers: Provider[] = getAuthJsProviders();
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, account, trigger }) {
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
              response.statusText
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
