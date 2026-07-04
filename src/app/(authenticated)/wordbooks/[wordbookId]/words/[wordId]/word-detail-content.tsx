import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WordDeleteDialog } from '@/components/word/word-delete-dialog';
import { WordDetail } from '@/components/word/word-detail';
import { getWordWithDetailsView } from '@/lib/dto/word';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type WordDetailContentProps = {
  wordbookId: string;
  wordId: string;
};

export async function WordDetailContent({
  wordbookId,
  wordId,
}: WordDetailContentProps) {
  let word;
  try {
    word = await getWordWithDetailsView(Number(wordbookId), Number(wordId));
  } catch {
    notFound();
  }

  const sortedMeanings = [...word.meanings]
    .sort((a, b) => a.display_order - b.display_order)
    .map((meaning) => ({
      ...meaning,
      examples: [...meaning.examples].sort(
        (a, b) => a.display_order - b.display_order
      ),
    }));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/wordbooks/${wordbookId}`}>← 単語一覧に戻る</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/wordbooks/${wordbookId}/words/${wordId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Link>
          </Button>
          <WordDeleteDialog
            wordId={word.id}
            wordbookId={Number(wordbookId)}
            wordSpelling={word.spelling}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <WordDetail
            wordbookId={Number(wordbookId)}
            word={word}
            meanings={sortedMeanings}
          />
        </CardContent>
      </Card>
    </>
  );
}
