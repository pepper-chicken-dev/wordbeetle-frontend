import 'server-only';

import type {
  CreateSettingInput,
  Setting,
  UpdateSettingInput,
} from '@/types/api';
import { apiRequest } from './client';
import { verifySession } from './session';

export async function getSetting(): Promise<Setting> {
  await verifySession();
  return apiRequest({ method: 'GET', path: '/setting' });
}

export async function createSetting(
  input: CreateSettingInput,
): Promise<Setting> {
  await verifySession();
  return apiRequest({
    method: 'POST',
    path: '/setting',
    body: { setting: input },
  });
}

export async function updateSetting(
  input: UpdateSettingInput,
): Promise<Setting> {
  await verifySession();
  return apiRequest({
    method: 'PATCH',
    path: '/setting',
    body: { setting: input },
  });
}

export async function deleteSetting(): Promise<void> {
  await verifySession();
  return apiRequest({ method: 'DELETE', path: '/setting' });
}
