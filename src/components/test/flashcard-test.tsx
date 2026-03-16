'use client';

import type { Example, Meaning, Word } from '@/types/api';
import { evaluateWordAction } from '@/lib/actions/word-actions';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Flashcard } from './flashcard';
import { SelfEvaluationButtons } from './self-evaluation-buttons';
import { TestComplete } from './test-complete';

type WordWithRelations = {
  word: Word;
  meanings: Meaning[];
  examples: Example[];
};

type FlashcardTestProps = {
  words: WordWithRelations[];
  wordbookId: number;
};

export function FlashcardTest({ words, wordbookId }: FlashcardTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">
          復習が必要な単語はありません
        </p>
      </div>
    );
  }

  if (currentIndex >= words.length) {
    return (
      <TestComplete wordbookId={wordbookId} totalCount={words.length} />
    );
  }

  const current = words[currentIndex];

  function handleEvaluate(evaluation: 'hard' | 'uncertain' | 'easy') {
    startTransition(async () => {
      const result = await evaluateWordAction(
        current.word.id,
        wordbookId,
        evaluation,
      );

      if (result.errors !== undefined && result.errors.length > 0) {
        toast.error(result.errors[0]);
        return;
      }

      setCurrentIndex((prev) => prev + 1);
    });
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-muted-foreground">
        {currentIndex + 1} / {words.length}
      </div>

      <Flashcard
        key={current.word.id}
        word={current.word}
        meanings={current.meanings}
        examples={current.examples}
      />

      <SelfEvaluationButtons
        onEvaluate={handleEvaluate}
        disabled={isPending}
      />
    </div>
  );
}
