'use server';

import { ApiError } from '@/lib/dal/client';
import { deleteExample } from '@/lib/dal/examples';
import { deleteMeaning } from '@/lib/dal/meanings';
import { createWord, deleteWord, updateWord } from '@/lib/dal/words';
import type {
  CreateExampleNestedInput,
  CreateMeaningNestedInput,
  UpdateExampleNestedInput,
  UpdateMeaningNestedInput,
  WordStatus,
} from '@/types/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type WordActionState = {
  errors?: string[];
};

type ParsedExample = {
  id?: number;
  sentence: string;
  translation: string;
};

type ParsedMeaning = {
  id?: number;
  definition: string;
  examples: ParsedExample[];
};

const MEANING_FIELD_REGEX = /^meanings\[(\d+)\]\[(id|definition)\]$/;
const EXAMPLE_FIELD_REGEX =
  /^meanings\[(\d+)\]\[examples\]\[(\d+)\]\[(id|sentence|translation)\]$/;

function parseMeaningsFromFormData(formData: FormData): ParsedMeaning[] {
  const meaningBucket = new Map<
    number,
    { id?: number; definition: string }
  >();
  const exampleBucket = new Map<number, Map<number, ParsedExample>>();

  const ensureMeaning = (i: number) => {
    let bucket = meaningBucket.get(i);
    if (bucket === undefined) {
      bucket = { definition: '' };
      meaningBucket.set(i, bucket);
    }
    return bucket;
  };

  const ensureExample = (mi: number, ei: number) => {
    let inner = exampleBucket.get(mi);
    if (inner === undefined) {
      inner = new Map();
      exampleBucket.set(mi, inner);
    }
    let ex = inner.get(ei);
    if (ex === undefined) {
      ex = { sentence: '', translation: '' };
      inner.set(ei, ex);
    }
    return ex;
  };

  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') continue;

    const mMatch = MEANING_FIELD_REGEX.exec(key);
    if (mMatch !== null) {
      const idx = Number(mMatch[1]);
      const field = mMatch[2];
      const meaning = ensureMeaning(idx);
      if (field === 'id') {
        const n = Number(value);
        if (!Number.isNaN(n)) meaning.id = n;
      } else {
        meaning.definition = value.trim();
      }
      continue;
    }

    const eMatch = EXAMPLE_FIELD_REGEX.exec(key);
    if (eMatch !== null) {
      const mi = Number(eMatch[1]);
      const ei = Number(eMatch[2]);
      const field = eMatch[3];
      ensureMeaning(mi);
      const example = ensureExample(mi, ei);
      if (field === 'id') {
        const n = Number(value);
        if (!Number.isNaN(n)) example.id = n;
      } else if (field === 'sentence') {
        example.sentence = value.trim();
      } else {
        example.translation = value.trim();
      }
    }
  }

  return [...meaningBucket.entries()]
    .sort(([a], [b]) => a - b)
    .map(([i, m]) => {
      const examples = exampleBucket.get(i);
      const exampleList: ParsedExample[] =
        examples === undefined
          ? []
          : [...examples.entries()]
              .sort(([a], [b]) => a - b)
              .map(([, e]) => e);
      return { ...m, examples: exampleList };
    });
}

function buildCreateMeaningsAttributes(
  parsed: ParsedMeaning[]
): CreateMeaningNestedInput[] | undefined {
  const result: CreateMeaningNestedInput[] = [];
  let meaningOrder = 1;
  for (const m of parsed) {
    if (m.definition === '') continue;
    const examples: CreateExampleNestedInput[] = [];
    let exampleOrder = 1;
    for (const e of m.examples) {
      if (e.sentence === '' || e.translation === '') continue;
      examples.push({
        sentence: e.sentence,
        translation: e.translation,
        display_order: exampleOrder,
      });
      exampleOrder += 1;
    }
    result.push({
      definition: m.definition,
      display_order: meaningOrder,
      examples_attributes: examples.length === 0 ? undefined : examples,
    });
    meaningOrder += 1;
  }
  return result.length === 0 ? undefined : result;
}

function buildUpdateMeaningsAttributes(
  parsed: ParsedMeaning[]
): UpdateMeaningNestedInput[] | undefined {
  const result: UpdateMeaningNestedInput[] = [];
  let meaningOrder = 1;
  for (const m of parsed) {
    if (m.definition === '') continue;
    const examples: UpdateExampleNestedInput[] = [];
    let exampleOrder = 1;
    for (const e of m.examples) {
      if (e.sentence === '' || e.translation === '') continue;
      examples.push(
        e.id !== undefined
          ? {
              id: e.id,
              sentence: e.sentence,
              translation: e.translation,
              display_order: exampleOrder,
            }
          : {
              sentence: e.sentence,
              translation: e.translation,
              display_order: exampleOrder,
            }
      );
      exampleOrder += 1;
    }
    const examplesAttr = examples.length === 0 ? undefined : examples;
    result.push(
      m.id !== undefined
        ? {
            id: m.id,
            definition: m.definition,
            display_order: meaningOrder,
            examples_attributes: examplesAttr,
          }
        : {
            definition: m.definition,
            display_order: meaningOrder,
            examples_attributes: examplesAttr,
          }
    );
    meaningOrder += 1;
  }
  return result.length === 0 ? undefined : result;
}

function parseRemovedMeaningIds(formData: FormData): number[] {
  return formData
    .getAll('removedMeaningIds')
    .filter((v): v is string => typeof v === 'string')
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
}

function parseRemovedExampleRefs(
  formData: FormData
): Array<{ meaningId: number; exampleId: number }> {
  return formData
    .getAll('removedExampleRefs')
    .filter((v): v is string => typeof v === 'string')
    .map((v) => {
      const [miStr, eiStr] = v.split(':');
      return { meaningId: Number(miStr), exampleId: Number(eiStr) };
    })
    .filter((r) => !Number.isNaN(r.meaningId) && !Number.isNaN(r.exampleId));
}

function collectClearedExamples(
  parsed: ParsedMeaning[]
): Array<{ meaningId: number; exampleId: number }> {
  const result: Array<{ meaningId: number; exampleId: number }> = [];
  for (const m of parsed) {
    if (m.id === undefined) continue;
    for (const e of m.examples) {
      if (e.id === undefined) continue;
      if (e.sentence === '' || e.translation === '') {
        result.push({ meaningId: m.id, exampleId: e.id });
      }
    }
  }
  return result;
}

export async function createWordAction(
  _prevState: WordActionState,
  formData: FormData
): Promise<WordActionState> {
  const wordbookId = formData.get('wordbookId');
  const spelling = formData.get('spelling');

  if (typeof spelling !== 'string' || spelling.trim() === '') {
    return { errors: ['スペルを入力してください'] };
  }

  if (typeof wordbookId !== 'string') {
    return { errors: ['単語帳が見つかりません'] };
  }

  const parsed = parseMeaningsFromFormData(formData);
  const meanings_attributes = buildCreateMeaningsAttributes(parsed);

  try {
    await createWord(Number(wordbookId), {
      spelling: spelling.trim(),
      meanings_attributes,
    });

    revalidatePath(`/wordbooks/${wordbookId}`);
    revalidatePath(`/wordbooks/${wordbookId}/test`);
    redirect(`/wordbooks/${wordbookId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['作成に失敗しました'] };
    }
    throw error;
  }
}

export async function updateWordAction(
  _prevState: WordActionState,
  formData: FormData
): Promise<WordActionState> {
  const wordId = formData.get('wordId');
  const wordbookId = formData.get('wordbookId');
  const spelling = formData.get('spelling');
  const status = formData.get('status') as WordStatus | null;

  if (typeof spelling !== 'string' || spelling.trim() === '') {
    return { errors: ['スペルを入力してください'] };
  }

  if (typeof wordId !== 'string' || typeof wordbookId !== 'string') {
    return { errors: ['単語が見つかりません'] };
  }

  const parsed = parseMeaningsFromFormData(formData);
  const meanings_attributes = buildUpdateMeaningsAttributes(parsed);

  const removedMeaningIds = parseRemovedMeaningIds(formData);
  const explicitExampleRefs = parseRemovedExampleRefs(formData);
  const clearedExampleRefs = collectClearedExamples(parsed);

  const exampleRefKeys = new Set<string>();
  const mergedExampleRefs: Array<{ meaningId: number; exampleId: number }> =
    [];
  for (const ref of [...explicitExampleRefs, ...clearedExampleRefs]) {
    const key = `${ref.meaningId}:${ref.exampleId}`;
    if (exampleRefKeys.has(key)) continue;
    exampleRefKeys.add(key);
    mergedExampleRefs.push(ref);
  }

  try {
    await updateWord(Number(wordbookId), Number(wordId), {
      spelling: spelling.trim(),
      status: status ?? undefined,
      meanings_attributes,
    });

    const meaningIdsToDelete = new Set(removedMeaningIds);
    for (const { meaningId, exampleId } of mergedExampleRefs) {
      if (meaningIdsToDelete.has(meaningId)) continue;
      await deleteExample(
        Number(wordbookId),
        Number(wordId),
        meaningId,
        exampleId
      );
    }
    for (const meaningId of removedMeaningIds) {
      await deleteMeaning(Number(wordbookId), Number(wordId), meaningId);
    }

    revalidatePath(`/wordbooks/${wordbookId}`);
    revalidatePath(`/wordbooks/${wordbookId}/test`);
    revalidatePath(`/wordbooks/${wordbookId}/words/${wordId}`);
    redirect(`/wordbooks/${wordbookId}/words/${wordId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['更新に失敗しました'] };
    }
    throw error;
  }
}

export async function updateWordStatusAction(
  wordId: number,
  wordbookId: number,
  status: WordStatus
): Promise<WordActionState> {
  try {
    await updateWord(wordbookId, wordId, { status });
    revalidatePath(`/wordbooks/${wordbookId}`);
    revalidatePath(`/wordbooks/${wordbookId}/test`);
    revalidatePath(`/wordbooks/${wordbookId}/words/${wordId}`);
    return {};
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['ステータス更新に失敗しました'] };
    }
    throw error;
  }
}

export async function deleteWordAction(
  wordId: number,
  wordbookId: number
): Promise<WordActionState> {
  try {
    await deleteWord(wordbookId, wordId);
    revalidatePath(`/wordbooks/${wordbookId}`);
    revalidatePath(`/wordbooks/${wordbookId}/test`);
    redirect(`/wordbooks/${wordbookId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['削除に失敗しました'] };
    }
    throw error;
  }
}

export async function evaluateWordAction(
  wordId: number,
  wordbookId: number,
  evaluation: 'hard' | 'uncertain' | 'easy'
): Promise<WordActionState> {
  try {
    await updateWord(wordbookId, wordId, {
      status: evaluation,
    });

    revalidatePath(`/wordbooks/${wordbookId}`);
    return {};
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['評価の保存に失敗しました'] };
    }
    throw error;
  }
}
