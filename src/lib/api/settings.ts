import type {
  CreateSettingInput,
  Setting,
  UpdateSettingInput,
} from '@/types/api';
import { apiRequest } from './client';

export function listSettings(): Promise<Setting[]> {
  return apiRequest({ method: 'GET', path: '/settings' });
}

export function getSetting(id: number): Promise<Setting> {
  return apiRequest({ method: 'GET', path: `/settings/${id}` });
}

export function createSetting(input: CreateSettingInput): Promise<Setting> {
  return apiRequest({
    method: 'POST',
    path: '/settings',
    body: { setting: input },
  });
}

export function updateSetting(
  id: number,
  input: UpdateSettingInput,
): Promise<Setting> {
  return apiRequest({
    method: 'PATCH',
    path: `/settings/${id}`,
    body: { setting: input },
  });
}

export function deleteSetting(id: number): Promise<void> {
  return apiRequest({ method: 'DELETE', path: `/settings/${id}` });
}
