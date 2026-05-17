'use client';

import { AudioPlayButton } from '@/components/audio/audio-play-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WordActionState } from '@/lib/actions/word-actions';
import {
  createWordAction,
  updateWordAction,
} from '@/lib/actions/word-actions';
import type { MeaningView } from '@/lib/dto/meaning';
import type { WordView } from '@/lib/dto/word';
import { useActionState, useRef, useState } from 'react';

type ExampleRow = {
  rowKey: string;
  id?: number;
  sentence: string;
  translation: string;
};

type MeaningRow = {
  rowKey: string;
  id?: number;
  definition: string;
  example: ExampleRow;
};

type WordFormProps = {
  wordbookId: number;
  word?: WordView;
  meanings?: MeaningView[];
};

function buildInitialRows(meanings: MeaningView[]): MeaningRow[] {
  if (meanings.length === 0) {
    return [
      {
        rowKey: 'new-0',
        definition: '',
        example: { rowKey: 'new-e-0', sentence: '', translation: '' },
      },
    ];
  }
  return meanings.map((m) => {
    const firstExample = m.examples[0];
    return {
      rowKey: `existing-m-${m.id}`,
      id: m.id,
      definition: m.definition,
      example:
        firstExample === undefined
          ? {
              rowKey: `new-e-for-m-${m.id}`,
              sentence: '',
              translation: '',
            }
          : {
              rowKey: `existing-e-${firstExample.id}`,
              id: firstExample.id,
              sentence: firstExample.sentence,
              translation: firstExample.translation,
            },
    };
  });
}

export function WordForm({
  wordbookId,
  word,
  meanings = [],
}: WordFormProps) {
  const isEditing = word !== undefined;
  const action = isEditing ? updateWordAction : createWordAction;
  const [state, formAction, isPending] = useActionState<
    WordActionState,
    FormData
  >(action, {});

  const [rows, setRows] = useState<MeaningRow[]>(() =>
    buildInitialRows(meanings)
  );
  const [removedMeaningIds, setRemovedMeaningIds] = useState<number[]>([]);

  const counterRef = useRef(0);
  const nextKey = (prefix: string) => {
    counterRef.current += 1;
    return `${prefix}-${counterRef.current}`;
  };

  const updateMeaningRow = (
    rowKey: string,
    updater: (m: MeaningRow) => MeaningRow
  ) => {
    setRows((prev) =>
      prev.map((m) => (m.rowKey === rowKey ? updater(m) : m))
    );
  };

  const addMeaning = () => {
    const k = nextKey('new-m');
    setRows((prev) => [
      ...prev,
      {
        rowKey: k,
        definition: '',
        example: { rowKey: `${k}-e`, sentence: '', translation: '' },
      },
    ]);
  };

  const removeMeaning = (rowKey: string) => {
    const target = rows.find((m) => m.rowKey === rowKey);
    if (target?.id !== undefined) {
      const removedId = target.id;
      setRemovedMeaningIds((ids) =>
        ids.includes(removedId) ? ids : [...ids, removedId]
      );
    }
    setRows((prev) => {
      const next = prev.filter((m) => m.rowKey !== rowKey);
      if (next.length === 0) {
        const k = nextKey('new-m');
        return [
          {
            rowKey: k,
            definition: '',
            example: { rowKey: `${k}-e`, sentence: '', translation: '' },
          },
        ];
      }
      return next;
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="wordbookId" value={wordbookId} />
      {isEditing && (
        <>
          <input type="hidden" name="wordId" value={word.id} />
          <input type="hidden" name="status" value={word.status} />
          {removedMeaningIds.map((id) => (
            <input
              key={`rm-m-${id}`}
              type="hidden"
              name="removedMeaningIds"
              value={id}
            />
          ))}
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>意味</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMeaning}
          >
            意味を追加
          </Button>
        </div>

        <ul className="space-y-4">
          {rows.map((m, i) => (
            <li
              key={m.rowKey}
              className="space-y-3 rounded-md border p-4"
            >
              {m.id !== undefined && (
                <input
                  type="hidden"
                  name={`meanings[${i}][id]`}
                  value={m.id}
                />
              )}

              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`meaning-def-${m.rowKey}`}>
                    意味 {i + 1}
                  </Label>
                  <Input
                    id={`meaning-def-${m.rowKey}`}
                    name={`meanings[${i}][definition]`}
                    value={m.definition}
                    onChange={(e) =>
                      updateMeaningRow(m.rowKey, (mm) => ({
                        ...mm,
                        definition: e.target.value,
                      }))
                    }
                    placeholder="例: りんご"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMeaning(m.rowKey)}
                  className="mt-7"
                >
                  削除
                </Button>
              </div>

              <div className="space-y-2 rounded-md border border-dashed p-3">
                {m.example.id !== undefined && (
                  <input
                    type="hidden"
                    name={`meanings[${i}][examples][0][id]`}
                    value={m.example.id}
                  />
                )}
                <Label htmlFor={`ex-sent-${m.example.rowKey}`}>例文</Label>
                <Textarea
                  id={`ex-sent-${m.example.rowKey}`}
                  name={`meanings[${i}][examples][0][sentence]`}
                  value={m.example.sentence}
                  onChange={(e) =>
                    updateMeaningRow(m.rowKey, (mm) => ({
                      ...mm,
                      example: { ...mm.example, sentence: e.target.value },
                    }))
                  }
                  placeholder="例: I ate an apple."
                  rows={2}
                />
                <Textarea
                  id={`ex-trans-${m.example.rowKey}`}
                  name={`meanings[${i}][examples][0][translation]`}
                  value={m.example.translation}
                  onChange={(e) =>
                    updateMeaningRow(m.rowKey, (mm) => ({
                      ...mm,
                      example: {
                        ...mm.example,
                        translation: e.target.value,
                      },
                    }))
                  }
                  placeholder="例: 私はりんごを食べた。"
                  rows={2}
                />
              </div>
            </li>
          ))}
        </ul>
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
          {isPending ? '保存中...' : isEditing ? '更新する' : '登録する'}
        </Button>
      </div>
    </form>
  );
}
