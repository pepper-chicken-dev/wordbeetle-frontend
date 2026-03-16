import type { CreateWordInput, UpdateWordInput, Word } from '@/types/api';
import { apiRequest } from './client';

export function listWords(): Promise<Word[]> {
  return apiRequest({ method: 'GET', path: '/words' });
}

export function getWord(id: number): Promise<Word> {
  return apiRequest({ method: 'GET', path: `/words/${id}` });
}

export function createWord(input: CreateWordInput): Promise<Word> {
  return apiRequest({
    method: 'POST',
    path: '/words',
    body: { word: input },
  });
}

export function updateWord(
  id: number,
  input: UpdateWordInput,
): Promise<Word> {
  return apiRequest({
    method: 'PATCH',
    path: `/words/${id}`,
    body: { word: input },
  });
}

export function deleteWord(id: number): Promise<void> {
  return apiRequest({ method: 'DELETE', path: `/words/${id}` });
}
