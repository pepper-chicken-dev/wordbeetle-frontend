import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WordDetailContent } from './word-detail-content';

type Props = {
  params: Promise<{ wordbookId: string; wordId: string }>;
};

export const metadata: Metadata = {
  title: '単語詳細 | WordBeetle',
};

export default async function WordDetailPage({ params }: Props) {
  const { wordbookId, wordId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          }
        >
          <WordDetailContent wordbookId={wordbookId} wordId={wordId} />
        </Suspense>
      </div>
    </div>
  );
}
