'use server';

import { ApiError } from '@/lib/api/client';
import { createWord, deleteWord, updateWord } from '@/lib/api/words';
import { createMeaning, updateMeaning } from '@/lib/api/meanings';
import { createExample, updateExample } from '@/lib/api/examples';
import { listSettings } from '@/lib/api/settings';
import type { Interval, WordStatus } from '@/types/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type WordActionState = {
  errors?: string[];
};

export async function createWordAction(
  _prevState: WordActionState,
  formData: FormData,
): Promise<WordActionState> {
  const wordbookId = formData.get('wordbookId');
  const spelling = formData.get('spelling');
  const meaningContent = formData.get('meaning');
  const exampleSentence = formData.get('exampleSentence');
  const exampleTranslation = formData.get('exampleTranslation');

  if (typeof spelling !== 'string' || spelling.trim() === '') {
    return { errors: ['スペルを入力してください'] };
  }

  if (typeof wordbookId !== 'string') {
    return { errors: ['単語帳が見つかりません'] };
  }

  try {
    const word = await createWord({
      wordbook_id: Number(wordbookId),
      spelling: spelling.trim(),
      status: 'not_studied',
    });

    if (typeof meaningContent === 'string' && meaningContent.trim() !== '') {
      await createMeaning({
        word_id: word.id,
        content: meaningContent.trim(),
        display_order: 1,
      });
    }

    if (
      typeof exampleSentence === 'string' &&
      exampleSentence.trim() !== '' &&
      typeof exampleTranslation === 'string' &&
      exampleTranslation.trim() !== ''
    ) {
      await createExample({
        word_id: word.id,
        sentence: exampleSentence.trim(),
        translation: exampleTranslation.trim(),
        display_order: 1,
      });
    }

    revalidatePath(`/wordbooks/${wordbookId}`);
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
  formData: FormData,
): Promise<WordActionState> {
  const wordId = formData.get('wordId');
  const wordbookId = formData.get('wordbookId');
  const spelling = formData.get('spelling');
  const status = formData.get('status') as WordStatus | null;
  const meaningId = formData.get('meaningId');
  const meaningContent = formData.get('meaning');
  const exampleId = formData.get('exampleId');
  const exampleSentence = formData.get('exampleSentence');
  const exampleTranslation = formData.get('exampleTranslation');

  if (typeof spelling !== 'string' || spelling.trim() === '') {
    return { errors: ['スペルを入力してください'] };
  }

  if (typeof wordId !== 'string' || typeof wordbookId !== 'string') {
    return { errors: ['単語が見つかりません'] };
  }

  try {
    await updateWord(Number(wordId), {
      spelling: spelling.trim(),
      status: status ?? undefined,
    });

    if (typeof meaningContent === 'string' && meaningContent.trim() !== '') {
      if (typeof meaningId === 'string' && meaningId !== '') {
        await updateMeaning(Number(meaningId), {
          content: meaningContent.trim(),
        });
      } else {
        await createMeaning({
          word_id: Number(wordId),
          content: meaningContent.trim(),
          display_order: 1,
        });
      }
    }

    if (
      typeof exampleSentence === 'string' &&
      exampleSentence.trim() !== '' &&
      typeof exampleTranslation === 'string' &&
      exampleTranslation.trim() !== ''
    ) {
      if (typeof exampleId === 'string' && exampleId !== '') {
        await updateExample(Number(exampleId), {
          sentence: exampleSentence.trim(),
          translation: exampleTranslation.trim(),
        });
      } else {
        await createExample({
          word_id: Number(wordId),
          sentence: exampleSentence.trim(),
          translation: exampleTranslation.trim(),
          display_order: 1,
        });
      }
    }

    revalidatePath(`/wordbooks/${wordbookId}`);
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
  status: WordStatus,
): Promise<WordActionState> {
  try {
    await updateWord(wordId, { status });
    revalidatePath(`/wordbooks/${wordbookId}`);
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
  wordbookId: number,
): Promise<WordActionState> {
  try {
    await deleteWord(wordId);
    revalidatePath(`/wordbooks/${wordbookId}`);
    redirect(`/wordbooks/${wordbookId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['削除に失敗しました'] };
    }
    throw error;
  }
}

function intervalToMs(interval: Interval): number {
  return (
    (interval.days * 24 * 60 + interval.hours * 60 + interval.minutes) *
    60 *
    1000
  );
}

export async function evaluateWordAction(
  wordId: number,
  wordbookId: number,
  evaluation: 'hard' | 'uncertain' | 'easy',
): Promise<WordActionState> {
  try {
    const settings = await listSettings();
    const setting = settings[0];

    let intervalMs: number;

    if (setting !== undefined) {
      const intervalMap: Record<
        'hard' | 'uncertain' | 'easy',
        Interval | null
      > = {
        hard: setting.hard_interval,
        uncertain: setting.uncertain_interval,
        easy: setting.easy_interval,
      };
      const interval = intervalMap[evaluation];

      if (interval !== null) {
        intervalMs = intervalToMs(interval);
      } else {
        intervalMs = getDefaultIntervalMs(evaluation);
      }
    } else {
      intervalMs = getDefaultIntervalMs(evaluation);
    }

    const nextReviewAt = new Date(Date.now() + intervalMs).toISOString();

    await updateWord(wordId, {
      status: evaluation,
      next_review_at: nextReviewAt,
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

function getDefaultIntervalMs(
  evaluation: 'hard' | 'uncertain' | 'easy',
): number {
  const defaults: Record<'hard' | 'uncertain' | 'easy', number> = {
    hard: 1 * 24 * 60 * 60 * 1000,
    uncertain: 3 * 24 * 60 * 60 * 1000,
    easy: 7 * 24 * 60 * 60 * 1000,
  };
  return defaults[evaluation];
}
