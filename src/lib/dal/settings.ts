import 'server-only';

import type {
  CreateSettingInput,
  Setting,
  UpdateSettingInput,
} from '@/types/api';
import { apiRequest } from './client';

export function getSetting(): Promise<Setting> {
  return apiRequest({ method: 'GET', path: '/setting' });
}

export function createSetting(input: CreateSettingInput): Promise<Setting> {
  return apiRequest({
    method: 'POST',
    path: '/setting',
    body: { setting: input },
  });
}

export function updateSetting(input: UpdateSettingInput): Promise<Setting> {
  return apiRequest({
    method: 'PATCH',
    path: '/setting',
    body: { setting: input },
  });
}

export function deleteSetting(): Promise<void> {
  return apiRequest({ method: 'DELETE', path: '/setting' });
}
