import { Skeleton } from '@/components/ui/skeleton';
import type { WordStatus } from '@/types/api';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WordbookDetailContent } from './wordbook-detail-content';

type Props = {
  params: Promise<{ wordbookId: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
};

export const metadata: Metadata = {
  title: '単語帳 | WordBeetle',
};

export default async function WordbookDetailPage({
  params,
  searchParams,
}: Props) {
  const { wordbookId } = await params;
  const { status, q } = await searchParams;

  const validStatuses: WordStatus[] = [
    'not_studied',
    'hard',
    'uncertain',
    'easy',
  ];
  const statusFilter =
    typeof status === 'string' && validStatuses.includes(status as WordStatus)
      ? (status as WordStatus)
      : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-9 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
              </div>
              <div className="space-y-2 mt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          }
        >
          <WordbookDetailContent
            wordbookId={Number(wordbookId)}
            statusFilter={statusFilter}
            query={q}
          />
        </Suspense>
      </div>
    </div>
  );
}
