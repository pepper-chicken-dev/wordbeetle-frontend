import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WordForm } from '@/components/word/word-form';
import { listExamples } from '@/lib/api/examples';
import { listMeanings } from '@/lib/api/meanings';
import { getWord } from '@/lib/api/words';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ wordbookId: string; wordId: string }>;
};

export const metadata: Metadata = {
  title: '単語を編集 | WordBeetle',
};

async function EditWordContent({
  wordbookId,
  wordId,
}: {
  wordbookId: string;
  wordId: string;
}) {
  let word;
  try {
    word = await getWord(Number(wordbookId), Number(wordId));
  } catch {
    notFound();
  }

  const [meanings, examples] = await Promise.all([
    listMeanings(Number(wordbookId), Number(wordId)),
    listExamples(Number(wordbookId), Number(wordId)),
  ]);

  const sortedMeanings = meanings.sort(
    (a, b) => a.display_order - b.display_order,
  );
  const sortedExamples = examples.sort(
    (a, b) => a.display_order - b.display_order,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>単語を編集</CardTitle>
      </CardHeader>
      <CardContent>
        <WordForm
          wordbookId={Number(wordbookId)}
          word={word}
          meaning={sortedMeanings[0]}
          example={sortedExamples[0]}
        />
      </CardContent>
    </Card>
  );
}

export default async function EditWordPage({ params }: Props) {
  const { wordbookId, wordId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Suspense fallback={<Skeleton className="h-64 rounded-lg" />}>
          <EditWordContent wordbookId={wordbookId} wordId={wordId} />
        </Suspense>
      </div>
    </div>
  );
}
