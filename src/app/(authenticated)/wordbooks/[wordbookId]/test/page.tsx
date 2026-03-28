import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlashcardTest } from '@/components/test/flashcard-test';
import { getTestWords } from '@/lib/api/words';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ wordbookId: string }>;
};

export const metadata: Metadata = {
  title: 'テスト | WordBeetle',
};

async function TestContent({ wordbookId }: { wordbookId: string }) {
  let data;
  try {
    data = await getTestWords(Number(wordbookId));
  } catch {
    notFound();
  }

  const { wordbook, words } = data;

  const wordsWithRelations = words.map((w) => {
    const { meanings, examples, ...word } = w;
    return {
      word,
      meanings: meanings.sort(
        (a, b) => a.display_order - b.display_order,
      ),
      examples: examples.sort(
        (a, b) => a.display_order - b.display_order,
      ),
    };
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{wordbook.title} - テスト</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/wordbooks/${wordbook.id}`}>戻る</Link>
        </Button>
      </div>

      <FlashcardTest words={wordsWithRelations} wordbookId={wordbook.id} />
    </>
  );
}

export default async function TestPage({ params }: Props) {
  const { wordbookId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
          }
        >
          <TestContent wordbookId={wordbookId} />
        </Suspense>
      </div>
    </div>
  );
}
