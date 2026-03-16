import { Separator } from '@/components/ui/separator';
import { AudioPlayButton } from '@/components/audio/audio-play-button';
import type { Example, Meaning, Word } from '@/types/api';
import { WordStatusBadge } from './word-status-badge';

type WordDetailProps = {
  word: Word;
  meanings: Meaning[];
  examples: Example[];
};

export function WordDetail({ word, meanings, examples }: WordDetailProps) {
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
          <ul className="space-y-1">
            {meanings.map((meaning) => (
              <li key={meaning.id} className="text-lg">
                {meaning.content}
              </li>
            ))}
          </ul>
        </div>
      )}

      {examples.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              例文
            </h3>
            <ul className="space-y-3">
              {examples.map((example) => (
                <li key={example.id} className="space-y-1">
                  <p className="text-base">{example.sentence}</p>
                  <p className="text-sm text-muted-foreground">
                    {example.translation}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
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
