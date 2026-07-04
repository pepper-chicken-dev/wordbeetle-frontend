import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/settings', () => ({
  getSetting: vi.fn(),
}));

import { ApiError } from '@/lib/dal/http';
import { getSetting } from '@/lib/dal/settings';
import { getSettingView } from './setting';

const mockedGetSetting = vi.mocked(getSetting);

describe('setting DTO', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('maps configured intervals without leaking extra fields', async () => {
    const apiSetting = {
      hard_interval: { days: 1, hours: 2, minutes: 3, seconds: 4 },
      uncertain_interval: null,
      easy_interval: { days: 7, hours: 0, minutes: 0, seconds: 0 },
    };
    mockedGetSetting.mockResolvedValue(apiSetting);

    const view = await getSettingView();

    expect(view).toEqual({
      hard_interval: { days: 1, hours: 2, minutes: 3 },
      uncertain_interval: null,
      easy_interval: { days: 7, hours: 0, minutes: 0 },
    });
    expect(view?.hard_interval).not.toHaveProperty('seconds');
    expect(view?.easy_interval).not.toHaveProperty('seconds');
  });

  it('maps missing settings to null', async () => {
    mockedGetSetting.mockRejectedValue(new ApiError(404, { error: 'missing' }));

    await expect(getSettingView()).resolves.toBeNull();
  });

  it('rethrows non-404 API errors', async () => {
    const error = new ApiError(500, { error: 'boom' });
    mockedGetSetting.mockRejectedValue(error);

    await expect(getSettingView()).rejects.toBe(error);
  });
});
