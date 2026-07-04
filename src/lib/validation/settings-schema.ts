import { z } from 'zod';

export const intervalSchema = z
  .object({
    days: z.coerce.number().int().min(0),
    hours: z.coerce.number().int().min(0).max(23),
    minutes: z.coerce.number().int().min(0).max(59),
  })
  .refine((v) => v.days * 1440 + v.hours * 60 + v.minutes >= 1, {
    message: '1分以上を指定してください',
  });

export const settingsFormSchema = z.object({
  hard_interval: intervalSchema,
  uncertain_interval: intervalSchema,
  easy_interval: intervalSchema,
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export type SettingsFieldErrors = Partial<
  Record<'hard' | 'uncertain' | 'easy', string>
>;

export function parseSettingsFormData(formData: FormData) {
  return settingsFormSchema.safeParse({
    hard_interval: {
      days: formData.get('hard_days'),
      hours: formData.get('hard_hours'),
      minutes: formData.get('hard_minutes'),
    },
    uncertain_interval: {
      days: formData.get('uncertain_days'),
      hours: formData.get('uncertain_hours'),
      minutes: formData.get('uncertain_minutes'),
    },
    easy_interval: {
      days: formData.get('easy_days'),
      hours: formData.get('easy_hours'),
      minutes: formData.get('easy_minutes'),
    },
  });
}

const intervalKeyToPrefix = {
  hard_interval: 'hard',
  uncertain_interval: 'uncertain',
  easy_interval: 'easy',
} as const;

export function mapZodErrorsToFieldErrors(
  error: z.ZodError
): SettingsFieldErrors {
  const fieldErrors: SettingsFieldErrors = {};
  for (const issue of error.issues) {
    const top = issue.path[0];
    if (
      top === 'hard_interval' ||
      top === 'uncertain_interval' ||
      top === 'easy_interval'
    ) {
      const prefix = intervalKeyToPrefix[top];
      if (fieldErrors[prefix] === undefined) {
        fieldErrors[prefix] = issue.message;
      }
    }
  }
  return fieldErrors;
}
