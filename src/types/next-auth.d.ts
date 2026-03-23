import { type DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    isGuest?: boolean;
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string;
      isGuest?: boolean;
    } & DefaultSession['user'];
  }
}
