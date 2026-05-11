import 'server-only';

import type {
  CreateWordbookInput,
  PaginatedResponse,
  UpdateWordbookInput,
  Wordbook,
} from '@/types/api';
import { apiRequest, buildListPath, type ListParams } from './client';
import { verifySession } from './session';

export async function listWordbooks(
  params?: ListParams,
): Promise<PaginatedResponse<Wordbook>> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: buildListPath('/wordbooks', params),
  });
}

export async function getWordbook(id: number): Promise<Wordbook> {
  await verifySession();
  return apiRequest({ method: 'GET', path: `/wordbooks/${id}` });
}

export async function createWordbook(
  input: CreateWordbookInput,
): Promise<Wordbook> {
  await verifySession();
  return apiRequest({
    method: 'POST',
    path: '/wordbooks',
    body: { wordbook: input },
  });
}

export async function updateWordbook(
  id: number,
  input: UpdateWordbookInput,
): Promise<Wordbook> {
  await verifySession();
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${id}`,
    body: { wordbook: input },
  });
}

export async function deleteWordbook(id: number): Promise<void> {
  await verifySession();
  return apiRequest({ method: 'DELETE', path: `/wordbooks/${id}` });
}
