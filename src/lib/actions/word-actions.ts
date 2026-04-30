'use server';

import { ApiError } from '@/lib/api/client';
import { createExample, updateExample } from '@/lib/api/examples';
import { createMeaning, updateMeaning } from '@/lib/api/meanings';
import { createWord, deleteWord, updateWord } from '@/lib/api/words';
import type { Meaning, WordStatus } from '@/types/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type WordActionState = {
  errors?: string[];
};

export async function createWordAction(
  _prevState: WordActionState,
  formData: FormData
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
    const word = await createWord(Number(wordbookId), {
      spelling: spelling.trim(),
    });

    let createdMeaning: Meaning | undefined;
    if (typeof meaningContent === 'string' && meaningContent.trim() !== '') {
      createdMeaning = await createMeaning(Number(wordbookId), word.id, {
        definition: meaningContent.trim(),
        display_order: 1,
      });
    }

    if (
      createdMeaning !== undefined &&
      typeof exampleSentence === 'string' &&
      exampleSentence.trim() !== '' &&
      typeof exampleTranslation === 'string' &&
      exampleTranslation.trim() !== ''
    ) {
      await createExample(Number(wordbookId), word.id, createdMeaning.id, {
        sentence: exampleSentence.trim(),
        translation: exampleTranslation.trim(),
        display_order: 1,
      });
    }

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
    await updateWord(Number(wordbookId), Number(wordId), {
      spelling: spelling.trim(),
      status: status ?? undefined,
    });

    let effectiveMeaningId: number | undefined =
      typeof meaningId === 'string' && meaningId !== ''
        ? Number(meaningId)
        : undefined;

    if (typeof meaningContent === 'string' && meaningContent.trim() !== '') {
      if (effectiveMeaningId !== undefined) {
        await updateMeaning(
          Number(wordbookId),
          Number(wordId),
          effectiveMeaningId,
          {
            definition: meaningContent.trim(),
          }
        );
      } else {
        const createdMeaning = await createMeaning(
          Number(wordbookId),
          Number(wordId),
          {
            definition: meaningContent.trim(),
            display_order: 1,
          }
        );
        effectiveMeaningId = createdMeaning.id;
      }
    }

    if (
      effectiveMeaningId !== undefined &&
      typeof exampleSentence === 'string' &&
      exampleSentence.trim() !== '' &&
      typeof exampleTranslation === 'string' &&
      exampleTranslation.trim() !== ''
    ) {
      if (typeof exampleId === 'string' && exampleId !== '') {
        await updateExample(
          Number(wordbookId),
          Number(wordId),
          effectiveMeaningId,
          Number(exampleId),
          {
            sentence: exampleSentence.trim(),
            translation: exampleTranslation.trim(),
          }
        );
      } else {
        await createExample(
          Number(wordbookId),
          Number(wordId),
          effectiveMeaningId,
          {
            sentence: exampleSentence.trim(),
            translation: exampleTranslation.trim(),
            display_order: 1,
          }
        );
      }
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
