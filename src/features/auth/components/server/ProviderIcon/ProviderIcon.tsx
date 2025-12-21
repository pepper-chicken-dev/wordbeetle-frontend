import type { IconBaseProps, IconType } from 'react-icons';

interface ProviderIconProps extends IconBaseProps {
  icon: IconType;
}

export function ProviderIcon({ icon: Icon, ...props }: ProviderIconProps) {
  return <Icon {...props} />;
}
