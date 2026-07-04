'use client';

import { AudioPlayButton } from '@/components/audio/audio-play-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WordActionState } from '@/lib/actions/word-actions';
import { createWordAction, updateWordAction } from '@/lib/actions/word-actions';
import type { MeaningView } from '@/lib/dto/meaning';
import type { WordView } from '@/lib/dto/word';
import { useActionState, useRef, useState } from 'react';
import { meaningCardClass } from './meaning-card-classes';

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

function emptyExample(rowKey: string): ExampleRow {
  return { rowKey, sentence: '', translation: '' };
}

function buildInitialState(meanings: MeaningView[]): {
  rows: MeaningRow[];
  removedExampleRefs: string[];
} {
  if (meanings.length === 0) {
    return {
      rows: [
        {
          rowKey: 'new-m-0',
          definition: '',
          example: emptyExample('new-e-0'),
        },
      ],
      removedExampleRefs: [],
    };
  }

  const removedExampleRefs: string[] = [];
  const rows = meanings.map((m) => {
    const [first, ...rest] = m.examples;
    for (const e of rest) {
      removedExampleRefs.push(`${m.id}:${e.id}`);
    }
    const example: ExampleRow =
      first === undefined
        ? emptyExample(`existing-e-empty-${m.id}`)
        : {
            rowKey: `existing-e-${first.id}`,
            id: first.id,
            sentence: first.sentence,
            translation: first.translation,
          };
    return {
      rowKey: `existing-m-${m.id}`,
      id: m.id,
      definition: m.definition,
      example,
    };
  });
  return { rows, removedExampleRefs };
}

export function WordForm({ wordbookId, word, meanings = [] }: WordFormProps) {
  const isEditing = word !== undefined;
  const action = isEditing ? updateWordAction : createWordAction;
  const [state, formAction, isPending] = useActionState<
    WordActionState,
    FormData
  >(action, {});

  const [initial] = useState(() => buildInitialState(meanings));
  const [rows, setRows] = useState<MeaningRow[]>(initial.rows);
  const [removedMeaningIds, setRemovedMeaningIds] = useState<number[]>([]);
  const [removedExampleRefs] = useState<string[]>(initial.removedExampleRefs);

  const counterRef = useRef(0);
  const nextKey = (prefix: string) => {
    counterRef.current += 1;
    return `${prefix}-${counterRef.current}`;
  };

  const updateMeaningRow = (
    rowKey: string,
    updater: (m: MeaningRow) => MeaningRow
  ) => {
    setRows((prev) => prev.map((m) => (m.rowKey === rowKey ? updater(m) : m)));
  };

  const addMeaning = () => {
    setRows((prev) => [
      ...prev,
      {
        rowKey: nextKey('new-m'),
        definition: '',
        example: emptyExample(nextKey('new-e')),
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
      return next.length === 0
        ? [
            {
              rowKey: nextKey('new-m'),
              definition: '',
              example: emptyExample(nextKey('new-e')),
            },
          ]
        : next;
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
          {removedExampleRefs.map((ref) => (
            <input
              key={`rm-e-${ref}`}
              type="hidden"
              name="removedExampleRefs"
              value={ref}
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
              className={`space-y-3 rounded-md border p-4 ${meaningCardClass(i)}`}
            >
              {m.id !== undefined && (
                <input type="hidden" name={`meanings[${i}][id]`} value={m.id} />
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

              <div className="space-y-2 rounded-md border border-dashed bg-white/70 p-3">
                {m.example.id !== undefined && (
                  <input
                    type="hidden"
                    name={`meanings[${i}][examples][0][id]`}
                    value={m.example.id}
                  />
                )}
                <Label htmlFor={`ex-sent-${m.rowKey}`}>例文</Label>
                <Textarea
                  id={`ex-sent-${m.rowKey}`}
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
                  id={`ex-trans-${m.rowKey}`}
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
