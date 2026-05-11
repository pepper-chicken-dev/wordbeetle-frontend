import 'server-only';

import type { ListParams } from '@/lib/dal/client';
import { getWordbook, listWordbooks } from '@/lib/dal/wordbooks';

export type WordbookView = {
  id: number;
  title: string;
  created_at: string;
};

export type WordbookListView = {
  data: WordbookView[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
};

function toWordbookView(input: {
  id: number;
  title: string;
  created_at: string;
}): WordbookView {
  return {
    id: input.id,
    title: input.title,
    created_at: input.created_at,
  };
}

export async function getWordbookView(id: number): Promise<WordbookView> {
  const wordbook = await getWordbook(id);
  return toWordbookView(wordbook);
}

export async function listWordbooksView(
  params?: ListParams,
): Promise<WordbookListView> {
  const response = await listWordbooks(params);
  return {
    data: response.data.map(toWordbookView),
    pagination: {
      current_page: response.pagination.current_page,
      total_pages: response.pagination.total_pages,
      total_count: response.pagination.total_count,
      per_page: response.pagination.per_page,
    },
  };
}
