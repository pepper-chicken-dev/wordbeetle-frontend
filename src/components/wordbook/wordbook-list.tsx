import { listWordbooks } from '@/lib/api/wordbooks';
import { WordbookCard } from './wordbook-card';

export async function WordbookList() {
  const wordbooks = await listWordbooks();

  if (wordbooks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          まだ単語帳がありません。最初の単語帳を作成しましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wordbooks.map((wordbook) => (
        <WordbookCard key={wordbook.id} wordbook={wordbook} />
      ))}
    </div>
  );
}
