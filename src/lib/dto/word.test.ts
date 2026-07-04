import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/words', () => ({
  getTestWords: vi.fn(),
  getWordWithDetails: vi.fn(),
  listWords: vi.fn(),
}));

import { getTestWords, getWordWithDetails, listWords } from '@/lib/dal/words';
import {
  getTestWordsView,
  getWordWithDetailsView,
  listWordsView,
} from './word';

const mockedGetTestWords = vi.mocked(getTestWords);
const mockedGetWordWithDetails = vi.mocked(getWordWithDetails);
const mockedListWords = vi.mocked(listWords);

describe('word DTO', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('maps word lists with first meanings and pagination', async () => {
    const apiWord = {
      id: 1,
      spelling: 'apple',
      status: 'not_studied' as const,
      next_review_at: null,
      first_meaning: { definition: 'りんご', private_note: 'hidden' },
      internal_score: 100,
    };
    mockedListWords.mockResolvedValue({
      data: [apiWord],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 1,
        per_page: 20,
      },
    });

    const view = await listWordsView(7, { page: 1 });

    expect(mockedListWords).toHaveBeenCalledWith(7, { page: 1 });
    expect(view).toEqual({
      data: [
        {
          id: 1,
          spelling: 'apple',
          status: 'not_studied',
          next_review_at: null,
          first_meaning: { definition: 'りんご' },
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 1,
        per_page: 20,
      },
    });
    expect(view.data[0]).not.toHaveProperty('internal_score');
    expect(view.data[0]?.first_meaning).not.toHaveProperty('private_note');
  });

  it('maps detailed words with meanings and examples', async () => {
    const apiWord = {
      id: 2,
      spelling: 'aurora',
      status: 'hard' as const,
      next_review_at: '2026-03-01T00:00:00.000Z',
      meanings: [
        {
          id: 3,
          definition: '極光',
          display_order: 1,
          internal_id: 'meaning-secret',
          examples: [
            {
              id: 4,
              sentence: 'The aurora glowed.',
              translation: 'オーロラが輝いた。',
              display_order: 1,
              internal_id: 'example-secret',
            },
          ],
        },
      ],
      internal_score: 80,
    };
    mockedGetWordWithDetails.mockResolvedValue(apiWord);

    const view = await getWordWithDetailsView(7, 2);

    expect(mockedGetWordWithDetails).toHaveBeenCalledWith(7, 2);
    expect(view).toEqual({
      id: 2,
      spelling: 'aurora',
      status: 'hard',
      next_review_at: '2026-03-01T00:00:00.000Z',
      meanings: [
        {
          id: 3,
          definition: '極光',
          display_order: 1,
          examples: [
            {
              id: 4,
              sentence: 'The aurora glowed.',
              translation: 'オーロラが輝いた。',
              display_order: 1,
            },
          ],
        },
      ],
    });
    expect(view).not.toHaveProperty('internal_score');
    expect(view.meanings[0]).not.toHaveProperty('internal_id');
    expect(view.meanings[0]?.examples[0]).not.toHaveProperty('internal_id');
  });

  it('maps test words and wordbook summary fields', async () => {
    const apiWord = {
      id: 5,
      spelling: 'nebula',
      status: 'easy' as const,
      next_review_at: null,
      meanings: [],
    };
    const apiWordbook = {
      id: 7,
      title: 'Space',
      created_at: '2026-04-01T00:00:00.000Z',
    };
    mockedGetTestWords.mockResolvedValue({
      wordbook: apiWordbook,
      words: [apiWord],
    });

    const view = await getTestWordsView(7);

    expect(view).toEqual({
      wordbook: { id: 7, title: 'Space' },
      words: [
        {
          id: 5,
          spelling: 'nebula',
          status: 'easy',
          next_review_at: null,
          meanings: [],
        },
      ],
    });
    expect(view.wordbook).not.toHaveProperty('created_at');
  });
});
