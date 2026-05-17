'use server';

import { signOut } from '@/lib/auth';
import { ApiError } from '@/lib/dal/client';
import { deleteCurrentUser } from '@/lib/dal/user';

export type DeleteAccountResult = { errors: string[] } | undefined;

export async function deleteAccountAction(): Promise<DeleteAccountResult> {
  try {
    await deleteCurrentUser();
  } catch (error) {
    if (error instanceof ApiError) {
      return { errors: ['アカウントの削除に失敗しました'] };
    }
    throw error;
  }

  await signOut({ redirectTo: '/auth' });
}
