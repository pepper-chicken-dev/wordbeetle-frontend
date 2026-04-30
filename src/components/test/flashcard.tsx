'use client';

import { AudioPlayButton } from '@/components/audio/audio-play-button';
import { Card, CardContent } from '@/components/ui/card';
import type { Example, Meaning, Word } from '@/types/api';
import { useState } from 'react';

type FlashcardProps = {
  word: Word;
  meanings: Meaning[];
  examples: Example[];
};

export function Flashcard({ word, meanings, examples }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <Card className="min-h-[250px] flex items-center justify-center">
        <CardContent className="text-center w-full py-8">
          {!isFlipped ? (
            <div className="space-y-4">
              <p className="text-3xl font-bold">{word.spelling}</p>
              <div onClick={(e) => e.stopPropagation()}>
                <AudioPlayButton text={word.spelling} size="default" />
              </div>
              <p className="text-sm text-muted-foreground">
                タップして答えを確認
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xl font-semibold text-muted-foreground">
                {word.spelling}
              </p>
              {meanings.length > 0 && (
                <div className="space-y-1">
                  {meanings.map((meaning) => (
                    <p key={meaning.id} className="text-2xl font-bold">
                      {meaning.definition}
                    </p>
                  ))}
                </div>
              )}
              {examples.length > 0 && (
                <div className="mt-4 space-y-2">
                  {examples.map((example) => (
                    <div key={example.id} className="text-sm">
                      <p className="text-foreground">{example.sentence}</p>
                      <p className="text-muted-foreground">
                        {example.translation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
