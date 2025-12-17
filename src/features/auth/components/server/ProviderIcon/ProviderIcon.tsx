import { providerMap } from '@/lib/auth';
import type { IconBaseProps, IconType } from 'react-icons';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

type ProviderId = (typeof providerMap)[number]['id'];
type ProviderIconMap = Record<ProviderId, IconType>;

const providerIconMap: ProviderIconMap = {
  google: FcGoogle,
  github: FaGithub,
};

interface ProviderIconProps extends IconBaseProps {
  providerId: ProviderId;
}

export function ProviderIcon({ providerId, ...Props }: ProviderIconProps) {
  const Icon = providerIconMap[providerId];
  return <Icon {...Props} />;
}
