import { listWordbooks } from '@/lib/api/wordbooks';
import { WordbookCard } from './wordbook-card';
import { WordbookPagination } from './wordbook-pagination';

const PER_PAGE = 12;

type Props = {
  page?: number;
};

export async function WordbookList({ page = 1 }: Props) {
  const { data: wordbooks, pagination } = await listWordbooks({
    page,
    perPage: PER_PAGE,
  });

  if (wordbooks.length === 0) {
    if (page > 1) {
      return (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            このページに単語帳がありません。
          </p>
          <WordbookPagination pagination={pagination} />
        </div>
      );
    }
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          まだ単語帳がありません。最初の単語帳を作成しましょう！
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wordbooks.map((wordbook) => (
          <WordbookCard key={wordbook.id} wordbook={wordbook} />
        ))}
      </div>
      <WordbookPagination pagination={pagination} />
    </>
  );
}
