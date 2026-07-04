import { describe, expect, it } from 'vitest';

import {
  intervalSchema,
  mapZodErrorsToFieldErrors,
  parseSettingsFormData,
  settingsFormSchema,
} from './settings-schema';

describe('intervalSchema', () => {
  it('accepts intervals of at least one minute', () => {
    const result = intervalSchema.safeParse({
      days: '1',
      hours: '2',
      minutes: '3',
    });

    expect(result.success).toBe(true);
    if (result.success === true) {
      expect(result.data).toEqual({ days: 1, hours: 2, minutes: 3 });
    }
  });

  it('rejects zero-length intervals', () => {
    const result = intervalSchema.safeParse({
      days: 0,
      hours: 0,
      minutes: 0,
    });

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error.issues[0]?.message).toBe('1分以上を指定してください');
    }
  });

  it('rejects hours, minutes, and fractional values outside the allowed range', () => {
    expect(
      intervalSchema.safeParse({ days: 0, hours: 24, minutes: 0 }).success
    ).toBe(false);
    expect(
      intervalSchema.safeParse({ days: 0, hours: 0, minutes: 60 }).success
    ).toBe(false);
    expect(
      intervalSchema.safeParse({ days: 0.5, hours: 0, minutes: 1 }).success
    ).toBe(false);
  });
});

describe('parseSettingsFormData', () => {
  it('maps form field names into settings intervals', () => {
    const formData = new FormData();
    formData.set('hard_days', '0');
    formData.set('hard_hours', '1');
    formData.set('hard_minutes', '0');
    formData.set('uncertain_days', '2');
    formData.set('uncertain_hours', '0');
    formData.set('uncertain_minutes', '30');
    formData.set('easy_days', '7');
    formData.set('easy_hours', '0');
    formData.set('easy_minutes', '0');

    const result = parseSettingsFormData(formData);

    expect(result.success).toBe(true);
    if (result.success === true) {
      expect(result.data).toEqual({
        hard_interval: { days: 0, hours: 1, minutes: 0 },
        uncertain_interval: { days: 2, hours: 0, minutes: 30 },
        easy_interval: { days: 7, hours: 0, minutes: 0 },
      });
    }
  });
});

describe('mapZodErrorsToFieldErrors', () => {
  it('maps top-level interval errors to form field prefixes', () => {
    const result = settingsFormSchema.safeParse({
      hard_interval: { days: 0, hours: 0, minutes: 0 },
      uncertain_interval: { days: 0, hours: 24, minutes: 0 },
      easy_interval: { days: 0, hours: 0, minutes: 60 },
    });

    expect(result.success).toBe(false);
    if (result.success === false) {
      const fieldErrors = mapZodErrorsToFieldErrors(result.error);
      expect(fieldErrors.hard).toBe('1分以上を指定してください');
      expect(typeof fieldErrors.uncertain).toBe('string');
      expect(typeof fieldErrors.easy).toBe('string');
    }
  });
});
