import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { IconType } from 'react-icons';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { getGuestAuthView } from '@/lib/dto/auth';

type AppProviderBase = {
  id: string;
  name: string;
  provider: Provider;
};

type OAuthProviderBase = AppProviderBase & {
  icon: IconType;
};

export const oauthProviders = [
  { id: 'google', name: 'Google', provider: Google, icon: FcGoogle },
  { id: 'github', name: 'GitHub', provider: GitHub, icon: FaGithub },
] as const satisfies readonly OAuthProviderBase[];

const guestProvider = {
  id: 'guest',
  name: 'Guest',
  provider: Credentials({
    id: 'guest',
    name: 'Guest',
    credentials: {},
    authorize: async () => {
      const guest = await getGuestAuthView();
      return {
        name: guest.name,
        image: '/guest-avatar.svg',
        accessToken: guest.token,
      };
    },
  }),
} as const satisfies AppProviderBase;

export const appProviders = [
  ...oauthProviders,
  guestProvider,
] as const satisfies readonly AppProviderBase[];

export type AppProvider = (typeof appProviders)[number];
export type AppProviderId = AppProvider['id'];

export type OAuthProvider = (typeof oauthProviders)[number];
export type OAuthProviderId = OAuthProvider['id'];

const oauthProviderIds: readonly OAuthProviderId[] = oauthProviders.map(
  (p) => p.id
);

export const isOAuthProviderId = (id: string): id is OAuthProviderId =>
  (oauthProviderIds as readonly string[]).includes(id);
