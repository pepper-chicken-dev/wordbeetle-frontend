'use server';

import {
  createWordbook,
  deleteWordbook,
  updateWordbook,
} from '@/lib/api/wordbooks';
import { ApiError } from '@/lib/api/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type WordbookActionState = {
  errors?: string[];
};

export async function createWordbookAction(
  _prevState: WordbookActionState,
  formData: FormData,
): Promise<WordbookActionState> {
  const title = formData.get('title');

  if (typeof title !== 'string' || title.trim() === '') {
    return { errors: ['タイトルを入力してください'] };
  }

  try {
    const wordbook = await createWordbook({
      title: title.trim(),
    });
    revalidatePath('/dashboard');
    redirect(`/wordbooks/${wordbook.id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['作成に失敗しました'] };
    }
    throw error;
  }
}

export async function updateWordbookAction(
  _prevState: WordbookActionState,
  formData: FormData,
): Promise<WordbookActionState> {
  const title = formData.get('title');
  const wordbookId = formData.get('wordbookId');

  if (typeof title !== 'string' || title.trim() === '') {
    return { errors: ['タイトルを入力してください'] };
  }

  if (typeof wordbookId !== 'string') {
    return { errors: ['単語帳が見つかりません'] };
  }

  try {
    await updateWordbook(Number(wordbookId), { title: title.trim() });
    revalidatePath('/dashboard');
    revalidatePath(`/wordbooks/${wordbookId}`);
    redirect(`/wordbooks/${wordbookId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['更新に失敗しました'] };
    }
    throw error;
  }
}

export async function deleteWordbookAction(
  wordbookId: number,
): Promise<WordbookActionState> {
  try {
    await deleteWordbook(wordbookId);
    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['削除に失敗しました'] };
    }
    throw error;
  }
}
