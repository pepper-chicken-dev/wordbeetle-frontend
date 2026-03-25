import type {
  CreateExampleInput,
  Example,
  UpdateExampleInput,
} from '@/types/api';
import { apiRequest } from './client';

export function listExamples(
  wordbookId: number,
  wordId: number,
): Promise<Example[]> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${wordId}/examples`,
  });
}

export function getExample(
  wordbookId: number,
  wordId: number,
  id: number,
): Promise<Example> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${wordId}/examples/${id}`,
  });
}

export function createExample(
  wordbookId: number,
  wordId: number,
  input: CreateExampleInput,
): Promise<Example> {
  return apiRequest({
    method: 'POST',
    path: `/wordbooks/${wordbookId}/words/${wordId}/examples`,
    body: { example: input },
  });
}

export function updateExample(
  wordbookId: number,
  wordId: number,
  id: number,
  input: UpdateExampleInput,
): Promise<Example> {
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${wordbookId}/words/${wordId}/examples/${id}`,
    body: { example: input },
  });
}

export function deleteExample(
  wordbookId: number,
  wordId: number,
  id: number,
): Promise<void> {
  return apiRequest({
    method: 'DELETE',
    path: `/wordbooks/${wordbookId}/words/${wordId}/examples/${id}`,
  });
}
