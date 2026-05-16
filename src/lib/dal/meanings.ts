import 'server-only';

import type {
  CreateMeaningInput,
  Meaning,
  PaginatedResponse,
  UpdateMeaningInput,
} from '@/types/api';
import { apiRequest, buildListPath, type ListParams } from './client';
import { verifySession } from './session';

export async function listMeanings(
  wordbookId: number,
  wordId: number,
  params?: ListParams,
): Promise<PaginatedResponse<Meaning>> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: buildListPath(
      `/wordbooks/${wordbookId}/words/${wordId}/meanings`,
      params,
    ),
  });
}

export async function getMeaning(
  wordbookId: number,
  wordId: number,
  id: number,
): Promise<Meaning> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${id}`,
  });
}

export async function createMeaning(
  wordbookId: number,
  wordId: number,
  input: CreateMeaningInput,
): Promise<Meaning> {
  await verifySession();
  return apiRequest({
    method: 'POST',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings`,
    body: { meaning: input },
  });
}

export async function updateMeaning(
  wordbookId: number,
  wordId: number,
  id: number,
  input: UpdateMeaningInput,
): Promise<Meaning> {
  await verifySession();
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${id}`,
    body: { meaning: input },
  });
}

export async function deleteMeaning(
  wordbookId: number,
  wordId: number,
  id: number,
): Promise<void> {
  await verifySession();
  return apiRequest({
    method: 'DELETE',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${id}`,
  });
}
