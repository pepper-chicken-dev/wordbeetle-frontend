import 'server-only';

import type {
  CreateExampleInput,
  Example,
  PaginatedResponse,
  UpdateExampleInput,
} from '@/types/api';
import { apiRequest, buildListPath, type ListParams } from './client';
import { verifySession } from './session';

export async function listExamples(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  params?: ListParams
): Promise<PaginatedResponse<Example>> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: buildListPath(
      `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples`,
      params
    ),
  });
}

export async function getExample(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  id: number
): Promise<Example> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples/${id}`,
  });
}

export async function createExample(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  input: CreateExampleInput
): Promise<Example> {
  await verifySession();
  return apiRequest({
    method: 'POST',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples`,
    body: { example: input },
  });
}

export async function updateExample(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  id: number,
  input: UpdateExampleInput
): Promise<Example> {
  await verifySession();
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples/${id}`,
    body: { example: input },
  });
}

export async function deleteExample(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  id: number
): Promise<void> {
  await verifySession();
  return apiRequest({
    method: 'DELETE',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples/${id}`,
  });
}
