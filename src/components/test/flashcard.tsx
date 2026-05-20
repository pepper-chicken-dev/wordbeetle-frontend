'use client';

import { useState } from 'react';

import { AudioPlayButton } from '@/components/audio/audio-play-button';
import { Card, CardContent } from '@/components/ui/card';
import type { MeaningView } from '@/lib/dto/meaning';
import type { WordView } from '@/lib/dto/word';

type FlashcardProps = {
  word: WordView;
  meanings: MeaningView[];
};

export function Flashcard({ word, meanings }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const primaryMeaning = meanings[0];

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
              {primaryMeaning !== undefined && (
                <div className="space-y-3">
                  <p className="text-2xl font-bold">
                    {primaryMeaning.definition}
                  </p>
                  {primaryMeaning.examples.map((example) => (
                    <div key={example.id} className="space-y-1 text-sm">
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
