import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

const providers: Provider[] = [Google, GitHub];

export const providerMap = [
  { id: 'google', name: 'Google' },
  { id: 'github', name: 'GitHub' },
] as const;

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
