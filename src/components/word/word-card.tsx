import { Card, CardContent } from '@/components/ui/card';
import type { WordView } from '@/lib/dto/word';
import Link from 'next/link';
import { WordStatusBadge } from './word-status-badge';

type WordCardProps = {
  word: WordView;
  meaning?: { definition: string };
  wordbookId: number;
};

export function WordCard({ word, meaning, wordbookId }: WordCardProps) {
  return (
    <Link href={`/wordbooks/${wordbookId}/words/${word.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-lg">{word.spelling}</span>
            {meaning !== undefined && (
              <span className="text-muted-foreground text-sm truncate">
                {meaning.definition}
              </span>
            )}
          </div>
          <WordStatusBadge status={word.status} />
        </CardContent>
      </Card>
    </Link>
  );
}
