import type {
  CreateMeaningInput,
  Meaning,
  UpdateMeaningInput,
} from '@/types/api';
import { apiRequest } from './client';

export function listMeanings(
  wordbookId: number,
  wordId: number,
): Promise<Meaning[]> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings`,
  });
}

export function getMeaning(
  wordbookId: number,
  wordId: number,
  id: number,
): Promise<Meaning> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${id}`,
  });
}

export function createMeaning(
  wordbookId: number,
  wordId: number,
  input: CreateMeaningInput,
): Promise<Meaning> {
  return apiRequest({
    method: 'POST',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings`,
    body: { meaning: input },
  });
}

export function updateMeaning(
  wordbookId: number,
  wordId: number,
  id: number,
  input: UpdateMeaningInput,
): Promise<Meaning> {
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${id}`,
    body: { meaning: input },
  });
}

export function deleteMeaning(
  wordbookId: number,
  wordId: number,
  id: number,
): Promise<void> {
  return apiRequest({
    method: 'DELETE',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${id}`,
  });
}
