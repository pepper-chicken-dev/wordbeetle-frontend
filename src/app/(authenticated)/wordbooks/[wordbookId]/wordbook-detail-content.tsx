import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { WordFilterBar } from '@/components/word/word-filter-bar';
import { WordList } from '@/components/word/word-list';
import { WordbookDeleteDialog } from '@/components/wordbook/wordbook-delete-dialog';
import { getWordbook } from '@/lib/api/wordbooks';
import type { WordStatus } from '@/types/api';
import { Edit, Layers, Plus } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type WordbookDetailContentProps = {
  wordbookId: number;
  statusFilter?: WordStatus;
  query?: string;
};

export async function WordbookDetailContent({
  wordbookId,
  statusFilter,
  query,
}: WordbookDetailContentProps) {
  let wordbook;
  try {
    wordbook = await getWordbook(wordbookId);
  } catch {
    notFound();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{wordbook.title}</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/wordbooks/${wordbook.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Link>
          </Button>
          <WordbookDeleteDialog
            wordbookId={wordbook.id}
            wordbookTitle={wordbook.title}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button asChild>
          <Link href={`/wordbooks/${wordbook.id}/words/new`}>
            <Plus className="mr-2 h-4 w-4" />
            単語を追加
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/wordbooks/${wordbook.id}/test`}>
            <Layers className="mr-2 h-4 w-4" />
            テスト開始
          </Link>
        </Button>
      </div>

      <Separator className="mb-6" />

      <Suspense
        fallback={
          <div className="py-8 text-center text-muted-foreground">
            読み込み中...
          </div>
        }
      >
        <WordFilterBar />
      </Suspense>

      <div className="mt-4">
        <WordList
          wordbookId={wordbookId}
          status={statusFilter}
          query={query}
        />
      </div>
    </>
  );
}
