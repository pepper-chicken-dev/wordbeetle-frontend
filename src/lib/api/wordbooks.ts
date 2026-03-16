import type {
  CreateWordbookInput,
  UpdateWordbookInput,
  Wordbook,
} from '@/types/api';
import { apiRequest } from './client';

export function listWordbooks(): Promise<Wordbook[]> {
  return apiRequest({ method: 'GET', path: '/wordbooks' });
}

export function getWordbook(id: number): Promise<Wordbook> {
  return apiRequest({ method: 'GET', path: `/wordbooks/${id}` });
}

export function createWordbook(input: CreateWordbookInput): Promise<Wordbook> {
  return apiRequest({
    method: 'POST',
    path: '/wordbooks',
    body: { wordbook: input },
  });
}

export function updateWordbook(
  id: number,
  input: UpdateWordbookInput,
): Promise<Wordbook> {
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${id}`,
    body: { wordbook: input },
  });
}

export function deleteWordbook(id: number): Promise<void> {
  return apiRequest({ method: 'DELETE', path: `/wordbooks/${id}` });
}
