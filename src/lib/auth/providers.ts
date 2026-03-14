import type { Provider as AuthJsProvider } from 'next-auth/providers';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { IconType } from 'react-icons';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

type ProviderIconAssociation = {
  provider: AuthJsProvider;
  icon: IconType;
};

const providerIconAssociations: ProviderIconAssociation[] = [
  {
    provider: Google,
    icon: FcGoogle,
  },
  {
    provider: GitHub,
    icon: FaGithub,
  },
];

export type Provider = {
  id: string;
  name: string;
  authJsProvider: AuthJsProvider;
  icon: IconType;
};

export const providers = Object.fromEntries(
  providerIconAssociations
    .map((item) => {
      if (typeof item.provider === 'function') {
        const providerData = item.provider();
        return [
          providerData.id,
          {
            id: providerData.id,
            name: providerData.name,
            authJsProvider: item.provider,
            icon: item.icon,
          } as Provider,
        ];
      } else {
        return [
          item.provider.id,
          {
            id: item.provider.id,
            name: item.provider.name,
            authJsProvider: item.provider,
            icon: item.icon,
          } as Provider,
        ];
      }
    })
    .filter(([id]) => id !== 'credentials')
) as Record<string, Provider>;

export const getAuthJsProviders = (): AuthJsProvider[] => {
  return Object.values(providers).map((p) => p.authJsProvider);
};

export const getProviderIds = (): string[] => {
  return Object.values(providers).map((p) => p.id);
};
