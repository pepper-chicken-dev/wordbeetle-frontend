import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WordForm } from '@/components/word/word-form';
import { getWordWithDetails } from '@/lib/dal/words';
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
    word = await getWordWithDetails(Number(wordbookId), Number(wordId));
  } catch {
    notFound();
  }

  const sortedMeanings = [...word.meanings].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const firstMeaning = sortedMeanings[0];
  const firstExample =
    firstMeaning !== undefined
      ? [...firstMeaning.examples].sort(
          (a, b) => a.display_order - b.display_order,
        )[0]
      : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>単語を編集</CardTitle>
      </CardHeader>
      <CardContent>
        <WordForm
          wordbookId={Number(wordbookId)}
          word={word}
          meaning={firstMeaning}
          example={firstExample}
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
