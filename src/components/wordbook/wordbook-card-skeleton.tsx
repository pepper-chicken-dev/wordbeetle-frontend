import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function WordbookCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
