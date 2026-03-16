'use client';

import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { useCallback } from 'react';

type AudioPlayButtonProps = {
  text?: string;
  textSelector?: string;
  size?: 'sm' | 'default';
};

export function AudioPlayButton({
  text,
  textSelector,
  size = 'sm',
}: AudioPlayButtonProps) {
  const handlePlay = useCallback(() => {
    let speakText = text;

    if (speakText === undefined && textSelector !== undefined) {
      const element = document.querySelector(textSelector);

      if (element instanceof HTMLInputElement) {
        speakText = element.value;
      } else if (element !== null) {
        speakText = element.textContent ?? undefined;
      }
    }

    if (speakText === undefined || speakText.trim() === '') {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [text, textSelector]);

  return (
    <Button
      type="button"
      variant="ghost"
      size={size === 'sm' ? 'icon' : 'default'}
      onClick={handlePlay}
      className={size === 'sm' ? 'h-8 w-8' : ''}
    >
      <Volume2 className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
    </Button>
  );
}
