'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  WordbookActionState,
} from '@/lib/actions/wordbook-actions';
import {
  createWordbookAction,
  updateWordbookAction,
} from '@/lib/actions/wordbook-actions';
import type { Wordbook } from '@/types/api';
import { useActionState } from 'react';

type WordbookFormProps = {
  wordbook?: Wordbook;
};

export function WordbookForm({ wordbook }: WordbookFormProps) {
  const isEditing = wordbook !== undefined;
  const action = isEditing ? updateWordbookAction : createWordbookAction;
  const [state, formAction, isPending] = useActionState<
    WordbookActionState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {isEditing && (
        <input type="hidden" name="wordbookId" value={wordbook.id} />
      )}

      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          defaultValue={wordbook?.title ?? ''}
          placeholder="例: TOEIC 頻出単語"
          required
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
              : '作成する'}
        </Button>
      </div>
    </form>
  );
}
