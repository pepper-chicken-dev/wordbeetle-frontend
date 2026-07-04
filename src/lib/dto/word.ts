import 'server-only';

import type { ListParams } from '@/lib/dal/client';
import { getTestWords, getWordWithDetails, listWords } from '@/lib/dal/words';
import type { WordStatus } from '@/types/api';
import { toMeaningView, type MeaningView } from './meaning';

export type WordView = {
  id: number;
  spelling: string;
  status: WordStatus;
  next_review_at: string | null;
};

export type WordWithFirstMeaningView = WordView & {
  first_meaning: { definition: string } | null;
};

export type WordWithDetailsView = WordView & {
  meanings: MeaningView[];
};

export type WordListView = {
  data: WordWithFirstMeaningView[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
};

export type TestWordsView = {
  wordbook: { id: number; title: string };
  words: WordWithDetailsView[];
};

function toWordWithFirstMeaningView(input: {
  id: number;
  spelling: string;
  status: WordStatus;
  next_review_at: string | null;
  first_meaning: { definition: string } | null;
}): WordWithFirstMeaningView {
  return {
    id: input.id,
    spelling: input.spelling,
    status: input.status,
    next_review_at: input.next_review_at,
    first_meaning:
      input.first_meaning === null
        ? null
        : { definition: input.first_meaning.definition },
  };
}

function toWordWithDetailsView(input: {
  id: number;
  spelling: string;
  status: WordStatus;
  next_review_at: string | null;
  meanings: Array<{
    id: number;
    definition: string;
    display_order: number;
    examples: Array<{
      id: number;
      sentence: string;
      translation: string;
      display_order: number;
    }>;
  }>;
}): WordWithDetailsView {
  return {
    id: input.id,
    spelling: input.spelling,
    status: input.status,
    next_review_at: input.next_review_at,
    meanings: input.meanings.map(toMeaningView),
  };
}

export async function listWordsView(
  wordbookId: number,
  params?: ListParams
): Promise<WordListView> {
  const response = await listWords(wordbookId, params);
  return {
    data: response.data.map(toWordWithFirstMeaningView),
    pagination: {
      current_page: response.pagination.current_page,
      total_pages: response.pagination.total_pages,
      total_count: response.pagination.total_count,
      per_page: response.pagination.per_page,
    },
  };
}

export async function getWordWithDetailsView(
  wordbookId: number,
  id: number
): Promise<WordWithDetailsView> {
  const word = await getWordWithDetails(wordbookId, id);
  return toWordWithDetailsView(word);
}

export async function getTestWordsView(
  wordbookId: number
): Promise<TestWordsView> {
  const response = await getTestWords(wordbookId);
  return {
    wordbook: {
      id: response.wordbook.id,
      title: response.wordbook.title,
    },
    words: response.words.map(toWordWithDetailsView),
  };
}
