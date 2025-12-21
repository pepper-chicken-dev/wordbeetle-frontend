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
    jwt({ token, account }) {
      if (account?.id_token !== undefined) {
        token.idToken = account.id_token;
      }

      return token;
    },
    session({ session, token }) {
      session.user.idToken = token.idToken;

      return session;
    },
  },
});
