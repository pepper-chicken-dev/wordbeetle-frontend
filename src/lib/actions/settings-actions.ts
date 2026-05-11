'use server';

import { ApiError } from '@/lib/dal/client';
import { createSetting, getSetting, updateSetting } from '@/lib/dal/settings';
import { parseSettingsFormData } from '@/lib/validation/settings-schema';
import { revalidatePath } from 'next/cache';

export type SettingsActionState = {
  errors?: string[];
  success?: boolean;
};

export async function saveSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const parsed = parseSettingsFormData(formData);
  if (!parsed.success) {
    return { errors: parsed.error.issues.map((issue) => issue.message) };
  }

  const { hard_interval, uncertain_interval, easy_interval } = parsed.data;

  try {
    let existing;
    try {
      existing = await getSetting();
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        existing = undefined;
      } else {
        throw error;
      }
    }

    if (existing !== undefined) {
      await updateSetting({
        hard_interval,
        uncertain_interval,
        easy_interval,
      });
    } else {
      await createSetting({
        hard_interval,
        uncertain_interval,
        easy_interval,
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
