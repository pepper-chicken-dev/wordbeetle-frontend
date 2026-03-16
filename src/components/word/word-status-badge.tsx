import { Badge } from '@/components/ui/badge';
import type { WordStatus } from '@/types/api';

type WordStatusBadgeProps = {
  status: WordStatus;
};

const statusConfig: Record<
  WordStatus,
  { label: string; variant: 'secondary' | 'destructive' | 'outline' }
> = {
  not_studied: { label: '未学習', variant: 'secondary' },
  hard: { label: '難しい', variant: 'destructive' },
  uncertain: { label: '曖昧', variant: 'outline' },
  easy: { label: '簡単', variant: 'secondary' },
};

export function WordStatusBadge({ status }: WordStatusBadgeProps) {
  const config = statusConfig[status];

  const colorClass = (() => {
    switch (status) {
      case 'not_studied':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'uncertain':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-300';
    }
  })();

  return (
    <Badge variant={config.variant} className={colorClass}>
      {config.label}
    </Badge>
  );
}
