import { getGoogleAuthView } from '@/lib/dto/auth';
import NextAuth from 'next-auth';
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

        const guestToken = await getAndClearGuestTokenCookie();

        const auth = await getGoogleAuthView(googleIdToken, guestToken);
        token.accessToken = auth.token;
        token.isGuest = false;
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
