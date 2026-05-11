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

export function listWords(
  wordbookId: number,
  params?: ListParams,
): Promise<PaginatedResponse<WordWithFirstMeaning>> {
  return apiRequest({
    method: 'GET',
    path: buildListPath(`/wordbooks/${wordbookId}/words`, params),
  });
}

export function getWord(wordbookId: number, id: number): Promise<Word> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${id}`,
  });
}

export function getWordWithDetails(
  wordbookId: number,
  id: number,
): Promise<WordWithDetails> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${id}?include=meanings,examples`,
  });
}

export function getTestWords(
  wordbookId: number,
): Promise<TestWordsResponse> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/test/words`,
  });
}

export function createWord(
  wordbookId: number,
  input: CreateWordInput,
): Promise<WordWithDetails> {
  return apiRequest({
    method: 'POST',
    path: `/wordbooks/${wordbookId}/words`,
    body: { word: input },
  });
}

export function updateWord(
  wordbookId: number,
  id: number,
  input: UpdateWordInput,
): Promise<Word> {
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${wordbookId}/words/${id}`,
    body: { word: input },
  });
}

export function deleteWord(wordbookId: number, id: number): Promise<void> {
  return apiRequest({
    method: 'DELETE',
    path: `/wordbooks/${wordbookId}/words/${id}`,
  });
}
