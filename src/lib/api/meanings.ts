import type {
  CreateMeaningInput,
  Meaning,
  UpdateMeaningInput,
} from '@/types/api';
import { apiRequest } from './client';

export function listMeanings(): Promise<Meaning[]> {
  return apiRequest({ method: 'GET', path: '/meanings' });
}

export function getMeaning(id: number): Promise<Meaning> {
  return apiRequest({ method: 'GET', path: `/meanings/${id}` });
}

export function createMeaning(input: CreateMeaningInput): Promise<Meaning> {
  return apiRequest({
    method: 'POST',
    path: '/meanings',
    body: { meaning: input },
  });
}

export function updateMeaning(
  id: number,
  input: UpdateMeaningInput,
): Promise<Meaning> {
  return apiRequest({
    method: 'PATCH',
    path: `/meanings/${id}`,
    body: { meaning: input },
  });
}

export function deleteMeaning(id: number): Promise<void> {
  return apiRequest({ method: 'DELETE', path: `/meanings/${id}` });
}
