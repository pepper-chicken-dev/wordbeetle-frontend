import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WordForm } from '@/components/word/word-form';
import { getWordbookView } from '@/lib/dto/wordbook';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '単語を追加 | WordBeetle',
};

type Props = {
  params: Promise<{ wordbookId: string }>;
};

async function NewWordContent({ wordbookId }: { wordbookId: string }) {
  try {
    await getWordbookView(Number(wordbookId));
  } catch {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>単語を追加</CardTitle>
      </CardHeader>
      <CardContent>
        <WordForm wordbookId={Number(wordbookId)} />
      </CardContent>
    </Card>
  );
}

export default async function NewWordPage({ params }: Props) {
  const { wordbookId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-lg" />}>
          <NewWordContent wordbookId={wordbookId} />
        </Suspense>
      </div>
    </div>
  );
}
