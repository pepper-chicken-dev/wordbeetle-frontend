import type { Provider as AuthJsProvider } from 'next-auth/providers';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { IconType } from 'react-icons';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

type ProviderEntry = {
  id: string;
  name: string;
  authJsProvider: AuthJsProvider;
  icon: IconType;
};

// Register a new OAuth provider by adding an entry here.
export const providers = [
  { id: 'google', name: 'Google', authJsProvider: Google, icon: FcGoogle },
  { id: 'github', name: 'GitHub', authJsProvider: GitHub, icon: FaGithub },
] as const satisfies readonly ProviderEntry[];

export type Provider = (typeof providers)[number];
export type ProviderId = Provider['id'];

const providerIds: readonly ProviderId[] = providers.map((p) => p.id);

export const authJsProviders: readonly AuthJsProvider[] = providers.map(
  (p) => p.authJsProvider
);

export const isProviderId = (id: string): id is ProviderId =>
  (providerIds as readonly string[]).includes(id);
