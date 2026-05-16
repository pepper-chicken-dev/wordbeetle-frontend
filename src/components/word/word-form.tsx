'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WordActionState } from '@/lib/actions/word-actions';
import {
  createWordAction,
  updateWordAction,
} from '@/lib/actions/word-actions';
import type { ExampleView } from '@/lib/dto/example';
import type { MeaningView } from '@/lib/dto/meaning';
import type { WordView } from '@/lib/dto/word';
import { useActionState } from 'react';
import { AudioPlayButton } from '@/components/audio/audio-play-button';

type WordFormProps = {
  wordbookId: number;
  word?: WordView;
  meaning?: MeaningView;
  example?: ExampleView;
};

export function WordForm({ wordbookId, word, meaning, example }: WordFormProps) {
  const isEditing = word !== undefined;
  const action = isEditing ? updateWordAction : createWordAction;
  const [state, formAction, isPending] = useActionState<
    WordActionState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="wordbookId" value={wordbookId} />
      {isEditing && (
        <>
          <input type="hidden" name="wordId" value={word.id} />
          {meaning !== undefined && (
            <input type="hidden" name="meaningId" value={meaning.id} />
          )}
          {example !== undefined && (
            <input type="hidden" name="exampleId" value={example.id} />
          )}
          <input type="hidden" name="status" value={word.status} />
        </>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="spelling">スペル</Label>
          <AudioPlayButton textSelector="#spelling" />
        </div>
        <Input
          id="spelling"
          name="spelling"
          defaultValue={word?.spelling ?? ''}
          placeholder="例: apple"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meaning">意味</Label>
        <Input
          id="meaning"
          name="meaning"
          defaultValue={meaning?.definition ?? ''}
          placeholder="例: りんご"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exampleSentence">例文</Label>
        <Textarea
          id="exampleSentence"
          name="exampleSentence"
          defaultValue={example?.sentence ?? ''}
          placeholder="例: I ate an apple."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exampleTranslation">例文の訳</Label>
        <Textarea
          id="exampleTranslation"
          name="exampleTranslation"
          defaultValue={example?.translation ?? ''}
          placeholder="例: 私はりんごを食べた。"
          rows={2}
        />
      </div>

      {state.errors !== undefined && state.errors.length > 0 && (
        <div className="text-sm text-destructive">
          {state.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? '保存中...'
            : isEditing
              ? '更新する'
              : '登録する'}
        </Button>
      </div>
    </form>
  );
}
