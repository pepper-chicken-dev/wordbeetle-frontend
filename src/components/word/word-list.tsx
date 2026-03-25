import { listMeanings } from '@/lib/api/meanings';
import { listWords } from '@/lib/api/words';
import type { Meaning, Word, WordStatus } from '@/types/api';
import { WordCard } from './word-card';

type WordListProps = {
  wordbookId: number;
  status?: WordStatus;
  query?: string;
};

export async function WordList({ wordbookId, status, query }: WordListProps) {
  const allWords = await listWords(wordbookId);

  const meaningEntries = await Promise.all(
    allWords.map(async (word) => {
      const meanings = await listMeanings(wordbookId, word.id);
      const first = meanings.sort(
        (a, b) => a.display_order - b.display_order,
      )[0] as Meaning | undefined;
      return [word.id, first] as const;
    }),
  );

  const meaningsByWordId = new Map<number, Meaning>();
  for (const [wordId, meaning] of meaningEntries) {
    if (meaning !== undefined) {
      meaningsByWordId.set(wordId, meaning);
    }
  }

  let filteredWords: Word[] = allWords;

  if (status !== undefined) {
    filteredWords = filteredWords.filter((w) => w.status === status);
  }

  if (query !== undefined && query.trim() !== '') {
    const lowerQuery = query.toLowerCase();
    filteredWords = filteredWords.filter((w) => {
      if (w.spelling.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      const meaning = meaningsByWordId.get(w.id);
      if (
        meaning !== undefined &&
        meaning.content.toLowerCase().includes(lowerQuery)
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
          meaning={meaningsByWordId.get(word.id)}
          wordbookId={wordbookId}
        />
      ))}
    </div>
  );
}
