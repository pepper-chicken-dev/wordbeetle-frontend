import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlashcardTest } from '@/components/test/flashcard-test';
import { listExamples } from '@/lib/api/examples';
import { listMeanings } from '@/lib/api/meanings';
import { getWordbook } from '@/lib/api/wordbooks';
import { listWords } from '@/lib/api/words';
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
  let wordbook;
  try {
    wordbook = await getWordbook(Number(wordbookId));
  } catch {
    notFound();
  }

  const allWords = await listWords(Number(wordbookId));

  const now = new Date();
  const reviewWords = allWords.filter((w) => {
    if (w.next_review_at === null) {
      return true;
    }
    return new Date(w.next_review_at) <= now;
  });

  const wordsWithRelations = await Promise.all(
    reviewWords.map(async (word) => {
      const [meanings, examples] = await Promise.all([
        listMeanings(Number(wordbookId), word.id),
        listExamples(Number(wordbookId), word.id),
      ]);
      return {
        word,
        meanings: meanings.sort(
          (a, b) => a.display_order - b.display_order,
        ),
        examples: examples.sort(
          (a, b) => a.display_order - b.display_order,
        ),
      };
    }),
  );

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
