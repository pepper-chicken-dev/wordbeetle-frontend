import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WordbookForm } from '@/components/wordbook/wordbook-form';
import { getWordbook } from '@/lib/api/wordbooks';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '単語帳を編集 | WordBeetle',
};

type Props = {
  params: Promise<{ wordbookId: string }>;
};

async function EditWordbookContent({
  wordbookId,
}: {
  wordbookId: string;
}) {
  let wordbook;
  try {
    wordbook = await getWordbook(Number(wordbookId));
  } catch {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>単語帳を編集</CardTitle>
      </CardHeader>
      <CardContent>
        <WordbookForm wordbook={wordbook} />
      </CardContent>
    </Card>
  );
}

export default async function EditWordbookPage({ params }: Props) {
  const { wordbookId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Suspense fallback={<Skeleton className="h-48 rounded-lg" />}>
          <EditWordbookContent wordbookId={wordbookId} />
        </Suspense>
      </div>
    </div>
  );
}
