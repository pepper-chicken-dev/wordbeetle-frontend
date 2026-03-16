import { type DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string;
    apiUserId?: number;
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      idToken?: string;
      apiUserId?: number;
    } & DefaultSession['user'];
  }
}
