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

const MAX_EXAMPLES_PER_MEANING = 2;

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
  examples: ExampleRow[];
};

type WordFormProps = {
  wordbookId: number;
  word?: WordView;
  meanings?: MeaningView[];
};

function buildInitialRows(meanings: MeaningView[]): MeaningRow[] {
  if (meanings.length === 0) {
    return [{ rowKey: 'new-0', definition: '', examples: [] }];
  }
  return meanings.map((m) => ({
    rowKey: `existing-m-${m.id}`,
    id: m.id,
    definition: m.definition,
    examples: m.examples.map((e) => ({
      rowKey: `existing-e-${e.id}`,
      id: e.id,
      sentence: e.sentence,
      translation: e.translation,
    })),
  }));
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
  const [removedExampleRefs, setRemovedExampleRefs] = useState<string[]>([]);

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
    setRows((prev) => [
      ...prev,
      { rowKey: nextKey('new-m'), definition: '', examples: [] },
    ]);
  };

  const removeMeaning = (rowKey: string) => {
    setRows((prev) => {
      const target = prev.find((m) => m.rowKey === rowKey);
      if (target?.id !== undefined) {
        setRemovedMeaningIds((ids) => [...ids, target.id as number]);
      }
      const next = prev.filter((m) => m.rowKey !== rowKey);
      return next.length === 0
        ? [{ rowKey: nextKey('new-m'), definition: '', examples: [] }]
        : next;
    });
  };

  const addExample = (meaningRowKey: string) => {
    updateMeaningRow(meaningRowKey, (m) => ({
      ...m,
      examples: [
        ...m.examples,
        { rowKey: nextKey('new-e'), sentence: '', translation: '' },
      ],
    }));
  };

  const removeExample = (meaningRowKey: string, exampleRowKey: string) => {
    setRows((prev) =>
      prev.map((m) => {
        if (m.rowKey !== meaningRowKey) return m;
        const target = m.examples.find((e) => e.rowKey === exampleRowKey);
        if (target?.id !== undefined && m.id !== undefined) {
          setRemovedExampleRefs((refs) => [
            ...refs,
            `${m.id as number}:${target.id as number}`,
          ]);
        }
        return {
          ...m,
          examples: m.examples.filter((e) => e.rowKey !== exampleRowKey),
        };
      })
    );
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

              <div className="space-y-3 pl-2">
                {m.examples.map((ex, j) => (
                  <div
                    key={ex.rowKey}
                    className="space-y-2 rounded-md border border-dashed p-3"
                  >
                    {ex.id !== undefined && (
                      <input
                        type="hidden"
                        name={`meanings[${i}][examples][${j}][id]`}
                        value={ex.id}
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`ex-sent-${ex.rowKey}`}>
                        例文 {j + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExample(m.rowKey, ex.rowKey)}
                      >
                        削除
                      </Button>
                    </div>
                    <Textarea
                      id={`ex-sent-${ex.rowKey}`}
                      name={`meanings[${i}][examples][${j}][sentence]`}
                      value={ex.sentence}
                      onChange={(e) =>
                        updateMeaningRow(m.rowKey, (mm) => ({
                          ...mm,
                          examples: mm.examples.map((eee) =>
                            eee.rowKey === ex.rowKey
                              ? { ...eee, sentence: e.target.value }
                              : eee
                          ),
                        }))
                      }
                      placeholder="例: I ate an apple."
                      rows={2}
                    />
                    <Textarea
                      id={`ex-trans-${ex.rowKey}`}
                      name={`meanings[${i}][examples][${j}][translation]`}
                      value={ex.translation}
                      onChange={(e) =>
                        updateMeaningRow(m.rowKey, (mm) => ({
                          ...mm,
                          examples: mm.examples.map((eee) =>
                            eee.rowKey === ex.rowKey
                              ? { ...eee, translation: e.target.value }
                              : eee
                          ),
                        }))
                      }
                      placeholder="例: 私はりんごを食べた。"
                      rows={2}
                    />
                  </div>
                ))}
                {m.examples.length < MAX_EXAMPLES_PER_MEANING && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addExample(m.rowKey)}
                  >
                    例文を追加
                  </Button>
                )}
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
