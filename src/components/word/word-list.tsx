import { listWords } from '@/lib/api/words';
import type { WordStatus, WordWithFirstMeaning } from '@/types/api';
import { WordCard } from './word-card';

type WordListProps = {
  wordbookId: number;
  status?: WordStatus;
  query?: string;
};

export async function WordList({ wordbookId, status, query }: WordListProps) {
  const { data: allWords } = await listWords(wordbookId);

  let filteredWords: WordWithFirstMeaning[] = allWords;

  if (status !== undefined) {
    filteredWords = filteredWords.filter((w) => w.status === status);
  }

  if (query !== undefined && query.trim() !== '') {
    const lowerQuery = query.toLowerCase();
    filteredWords = filteredWords.filter((w) => {
      if (w.spelling.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      if (
        w.first_meaning !== null &&
        w.first_meaning.definition.toLowerCase().includes(lowerQuery)
      ) {
        return true;
      }
      return false;
    });
  }

  if (filteredWords.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {query !== undefined && query.trim() !== ''
            ? '該当する単語が見つかりません'
            : 'まだ単語がありません。単語を追加しましょう！'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredWords.map((word) => (
        <WordCard
          key={word.id}
          word={word}
          meaning={word.first_meaning ?? undefined}
          wordbookId={wordbookId}
        />
      ))}
    </div>
  );
}
