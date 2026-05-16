import 'server-only';

import { ApiError } from '@/lib/dal/client';
import { getSetting } from '@/lib/dal/settings';

export type IntervalView = {
  days: number;
  hours: number;
  minutes: number;
};

export type SettingView = {
  hard_interval: IntervalView | null;
  uncertain_interval: IntervalView | null;
  easy_interval: IntervalView | null;
};

function toIntervalView(
  input: { days: number; hours: number; minutes: number } | null,
): IntervalView | null {
  if (input === null) return null;
  return {
    days: input.days,
    hours: input.hours,
    minutes: input.minutes,
  };
}

export async function getSettingView(): Promise<SettingView | null> {
  try {
    const setting = await getSetting();
    return {
      hard_interval: toIntervalView(setting.hard_interval),
      uncertain_interval: toIntervalView(setting.uncertain_interval),
      easy_interval: toIntervalView(setting.easy_interval),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
