import { Separator } from '@/components/ui/separator';
import { AudioPlayButton } from '@/components/audio/audio-play-button';
import type { MeaningView } from '@/lib/dto/meaning';
import type { WordView } from '@/lib/dto/word';
import { WordStatusBadge } from './word-status-badge';

type WordDetailProps = {
  word: WordView;
  meanings: MeaningView[];
};

export function WordDetail({ word, meanings }: WordDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold">{word.spelling}</h2>
        <AudioPlayButton text={word.spelling} />
        <WordStatusBadge status={word.status} />
      </div>

      {meanings.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            意味
          </h3>
          <ul className="space-y-4">
            {meanings.map((meaning) => (
              <li key={meaning.id} className="space-y-2">
                <p className="text-lg">{meaning.definition}</p>
                {meaning.examples.length > 0 && (
                  <ul className="space-y-2 pl-4 border-l-2 border-muted">
                    {meaning.examples.map((example) => (
                      <li key={example.id} className="space-y-1">
                        <p className="text-base">{example.sentence}</p>
                        <p className="text-sm text-muted-foreground">
                          {example.translation}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
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
