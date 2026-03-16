import type {
  CreateExampleInput,
  Example,
  UpdateExampleInput,
} from '@/types/api';
import { apiRequest } from './client';

export function listExamples(): Promise<Example[]> {
  return apiRequest({ method: 'GET', path: '/examples' });
}

export function getExample(id: number): Promise<Example> {
  return apiRequest({ method: 'GET', path: `/examples/${id}` });
}

export function createExample(input: CreateExampleInput): Promise<Example> {
  return apiRequest({
    method: 'POST',
    path: '/examples',
    body: { example: input },
  });
}

export function updateExample(
  id: number,
  input: UpdateExampleInput,
): Promise<Example> {
  return apiRequest({
    method: 'PATCH',
    path: `/examples/${id}`,
    body: { example: input },
  });
}

export function deleteExample(id: number): Promise<void> {
  return apiRequest({ method: 'DELETE', path: `/examples/${id}` });
}
