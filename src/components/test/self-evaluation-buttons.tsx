'use client';

import { Button } from '@/components/ui/button';

type SelfEvaluationButtonsProps = {
  onEvaluate: (evaluation: 'hard' | 'uncertain' | 'easy') => void;
  disabled: boolean;
};

export function SelfEvaluationButtons({
  onEvaluate,
  disabled,
}: SelfEvaluationButtonsProps) {
  return (
    <div className="flex gap-3 justify-center">
      <Button
        variant="destructive"
        onClick={() => onEvaluate('hard')}
        disabled={disabled}
        className="flex-1"
      >
        難しい
      </Button>
      <Button
        variant="outline"
        onClick={() => onEvaluate('uncertain')}
        disabled={disabled}
        className="flex-1 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
      >
        曖昧
      </Button>
      <Button
        variant="default"
        onClick={() => onEvaluate('easy')}
        disabled={disabled}
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        簡単
      </Button>
    </div>
  );
}
