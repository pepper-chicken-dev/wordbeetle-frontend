import type {
  CreateWordInput,
  UpdateWordInput,
  Word,
  WordWithDetails,
  WordWithFirstMeaning,
} from '@/types/api';
import { apiRequest } from './client';

export function listWords(
  wordbookId: number,
): Promise<WordWithFirstMeaning[]> {
  return apiRequest({ method: 'GET', path: `/wordbooks/${wordbookId}/words` });
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

export function createWord(
  wordbookId: number,
  input: CreateWordInput,
): Promise<Word> {
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
