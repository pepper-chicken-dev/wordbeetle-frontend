'use server';

import { ApiError } from '@/lib/api/client';
import { createSetting, listSettings, updateSetting } from '@/lib/api/settings';
import { auth } from '@/lib/auth';
import type { Interval } from '@/types/api';
import { revalidatePath } from 'next/cache';

export type SettingsActionState = {
  errors?: string[];
  success?: boolean;
};

function parseInterval(formData: FormData, prefix: string): Interval {
  const days = Number(formData.get(`${prefix}_days`) ?? '0');
  const hours = Number(formData.get(`${prefix}_hours`) ?? '0');
  const minutes = Number(formData.get(`${prefix}_minutes`) ?? '0');
  return { days, hours, minutes };
}

export async function saveSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.apiUserId;

  if (userId === undefined) {
    return { errors: ['認証情報が取得できません'] };
  }

  const hardInterval = parseInterval(formData, 'hard');
  const uncertainInterval = parseInterval(formData, 'uncertain');
  const easyInterval = parseInterval(formData, 'easy');

  try {
    const settings = await listSettings();
    const existing = settings[0];

    if (existing !== undefined) {
      await updateSetting(existing.id, {
        hard_interval: hardInterval,
        uncertain_interval: uncertainInterval,
        easy_interval: easyInterval,
      });
    } else {
      await createSetting({
        user_id: userId,
        hard_interval: hardInterval,
        uncertain_interval: uncertainInterval,
        easy_interval: easyInterval,
      });
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { errors?: string[] } | null;
      return { errors: body?.errors ?? ['設定の保存に失敗しました'] };
    }
    throw error;
  }
}
