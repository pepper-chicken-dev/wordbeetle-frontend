'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { AudioPlayButton } from '@/components/audio/audio-play-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Example, Meaning, Word } from '@/types/api';

type FlashcardProps = {
  word: Word;
  meanings: Meaning[];
  examples: Example[];
};

export function Flashcard({ word, meanings, examples }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [meaningsExpanded, setMeaningsExpanded] = useState(false);
  const [examplesExpanded, setExamplesExpanded] = useState(false);

  const visibleMeanings = meaningsExpanded ? meanings : meanings.slice(0, 3);
  const hiddenMeaningsCount = meanings.length - 3;

  const visibleExamples = examplesExpanded ? examples : examples.slice(0, 2);
  const hiddenExamplesCount = examples.length - 2;

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
                  {visibleMeanings.map((meaning, index) => (
                    <p
                      key={meaning.id}
                      className={
                        index === 0
                          ? 'text-2xl font-bold'
                          : 'text-base text-muted-foreground'
                      }
                    >
                      {meaning.definition}
                    </p>
                  ))}
                  {hiddenMeaningsCount > 0 && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setMeaningsExpanded(!meaningsExpanded)}
                      >
                        {meaningsExpanded ? (
                          <>
                            <ChevronUp />
                            閉じる
                          </>
                        ) : (
                          <>
                            <ChevronDown />+{hiddenMeaningsCount} more
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {examples.length > 0 && (
                <div className="mt-4 space-y-2">
                  {visibleExamples.map((example, index) => (
                    <div
                      key={example.id}
                      className={
                        index === 0
                          ? 'text-sm'
                          : 'text-xs text-muted-foreground'
                      }
                    >
                      <p className="text-foreground">{example.sentence}</p>
                      <p className="text-muted-foreground">
                        {example.translation}
                      </p>
                    </div>
                  ))}
                  {hiddenExamplesCount > 0 && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setExamplesExpanded(!examplesExpanded)}
                      >
                        {examplesExpanded ? (
                          <>
                            <ChevronUp />
                            閉じる
                          </>
                        ) : (
                          <>
                            <ChevronDown />+{hiddenExamplesCount} more
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
