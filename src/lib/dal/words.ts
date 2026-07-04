import 'server-only';

import type {
  CreateWordInput,
  PaginatedResponse,
  TestWordsResponse,
  UpdateWordInput,
  Word,
  WordWithDetails,
  WordWithFirstMeaning,
} from '@/types/api';
import { apiRequest, buildListPath, type ListParams } from './client';
import { verifySession } from './session';

export async function listWords(
  wordbookId: number,
  params?: ListParams
): Promise<PaginatedResponse<WordWithFirstMeaning>> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: buildListPath(`/wordbooks/${wordbookId}/words`, params),
  });
}

export async function getWord(wordbookId: number, id: number): Promise<Word> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${id}`,
  });
}

export async function getWordWithDetails(
  wordbookId: number,
  id: number
): Promise<WordWithDetails> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${id}?include=meanings,examples`,
  });
}

export async function getTestWords(
  wordbookId: number
): Promise<TestWordsResponse> {
  await verifySession();
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/test/words`,
  });
}

export async function createWord(
  wordbookId: number,
  input: CreateWordInput
): Promise<WordWithDetails> {
  await verifySession();
  return apiRequest({
    method: 'POST',
    path: `/wordbooks/${wordbookId}/words`,
    body: { word: input },
  });
}

export async function updateWord(
  wordbookId: number,
  id: number,
  input: UpdateWordInput
): Promise<Word> {
  await verifySession();
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${wordbookId}/words/${id}`,
    body: { word: input },
  });
}

export async function deleteWord(
  wordbookId: number,
  id: number
): Promise<void> {
  await verifySession();
  return apiRequest({
    method: 'DELETE',
    path: `/wordbooks/${wordbookId}/words/${id}`,
  });
}
