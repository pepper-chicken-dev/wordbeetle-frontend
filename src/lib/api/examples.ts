import type {
  CreateExampleInput,
  Example,
  UpdateExampleInput,
} from '@/types/api';
import { apiRequest } from './client';

export function listExamples(
  wordbookId: number,
  wordId: number,
  meaningId: number,
): Promise<Example[]> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples`,
  });
}

export function getExample(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  id: number,
): Promise<Example> {
  return apiRequest({
    method: 'GET',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples/${id}`,
  });
}

export function createExample(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  input: CreateExampleInput,
): Promise<Example> {
  return apiRequest({
    method: 'POST',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples`,
    body: { example: input },
  });
}

export function updateExample(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  id: number,
  input: UpdateExampleInput,
): Promise<Example> {
  return apiRequest({
    method: 'PATCH',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples/${id}`,
    body: { example: input },
  });
}

export function deleteExample(
  wordbookId: number,
  wordId: number,
  meaningId: number,
  id: number,
): Promise<void> {
  return apiRequest({
    method: 'DELETE',
    path: `/wordbooks/${wordbookId}/words/${wordId}/meanings/${meaningId}/examples/${id}`,
  });
}
