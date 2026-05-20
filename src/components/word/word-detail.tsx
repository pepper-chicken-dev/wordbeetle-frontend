import { Separator } from '@/components/ui/separator';
import { AudioPlayButton } from '@/components/audio/audio-play-button';
import type { MeaningView } from '@/lib/dto/meaning';
import type { WordView } from '@/lib/dto/word';
import { WordDetailMeanings } from './word-detail-meanings';
import { WordStatusBadge } from './word-status-badge';

type WordDetailProps = {
  wordbookId: number;
  word: WordView;
  meanings: MeaningView[];
};

export function WordDetail({ wordbookId, word, meanings }: WordDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold">{word.spelling}</h2>
        <AudioPlayButton text={word.spelling} />
        <WordStatusBadge status={word.status} />
      </div>

      {meanings.length > 0 && (
        <WordDetailMeanings
          key={meanings.map((m) => m.id).join('-')}
          wordbookId={wordbookId}
          wordId={word.id}
          meanings={meanings}
        />
      )}

      {word.next_review_at !== null && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              次の復習
            </h3>
            <p className="text-sm">
              {new Date(word.next_review_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
