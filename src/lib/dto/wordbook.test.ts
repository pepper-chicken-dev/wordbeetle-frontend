import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/wordbooks', () => ({
  getWordbook: vi.fn(),
  listWordbooks: vi.fn(),
}));

import { getWordbook, listWordbooks } from '@/lib/dal/wordbooks';
import { getWordbookView, listWordbooksView } from './wordbook';

const mockedGetWordbook = vi.mocked(getWordbook);
const mockedListWordbooks = vi.mocked(listWordbooks);

describe('wordbook DTO', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('selects only public wordbook fields', async () => {
    const apiWordbook = {
      id: 10,
      title: 'Animals',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
    };
    mockedGetWordbook.mockResolvedValue(apiWordbook);

    const view = await getWordbookView(10);

    expect(view).toEqual({
      id: 10,
      title: 'Animals',
      created_at: '2026-01-01T00:00:00.000Z',
    });
    expect(view).not.toHaveProperty('updated_at');
  });

  it('maps paginated wordbook lists without leaking extra fields', async () => {
    const apiWordbook = {
      id: 20,
      title: 'Food',
      created_at: '2026-02-01T00:00:00.000Z',
      owner_id: 999,
    };
    mockedListWordbooks.mockResolvedValue({
      data: [apiWordbook],
      pagination: {
        current_page: 1,
        total_pages: 2,
        total_count: 3,
        per_page: 4,
      },
    });

    const view = await listWordbooksView({ page: 1, perPage: 4 });

    expect(mockedListWordbooks).toHaveBeenCalledWith({ page: 1, perPage: 4 });
    expect(view).toEqual({
      data: [
        {
          id: 20,
          title: 'Food',
          created_at: '2026-02-01T00:00:00.000Z',
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 2,
        total_count: 3,
        per_page: 4,
      },
    });
    expect(view.data[0]).not.toHaveProperty('owner_id');
  });
});
