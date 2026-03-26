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
  const [testWords, setTestWords] = useState(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const testWordIds = new Set(testWords.map((w) => w.word.id));
  const hasNewWords = words.some((w) => !testWordIds.has(w.word.id));
  if (hasNewWords) {
    setTestWords(words);
    setCurrentIndex(0);
  }

  if (testWords.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">
          復習が必要な単語はありません
        </p>
      </div>
    );
  }

  if (currentIndex >= testWords.length) {
    return (
      <TestComplete wordbookId={wordbookId} totalCount={testWords.length} />
    );
  }

  const current = testWords[currentIndex];

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
        {currentIndex + 1} / {testWords.length}
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
