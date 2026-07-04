'use client';

import { Button } from '@/components/ui/button';
import type { SettingsActionState } from '@/lib/actions/settings-actions';
import { saveSettingsAction } from '@/lib/actions/settings-actions';
import type { SettingView } from '@/lib/dto/setting';
import {
  mapZodErrorsToFieldErrors,
  parseSettingsFormData,
  type SettingsFieldErrors,
} from '@/lib/validation/settings-schema';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IntervalInput } from './interval-input';

type SettingsFormProps = {
  setting?: SettingView;
};

const defaultIntervals = {
  hard: { days: 1, hours: 0, minutes: 0 },
  uncertain: { days: 3, hours: 0, minutes: 0 },
  easy: { days: 7, hours: 0, minutes: 0 },
};

export function SettingsForm({ setting }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState<
    SettingsActionState,
    FormData
  >(saveSettingsAction, {});

  const [fieldErrors, setFieldErrors] = useState<SettingsFieldErrors>({});

  useEffect(() => {
    if (state.success === true) {
      toast.success('設定を保存しました');
    }
  }, [state.success]);

  const handleAction = (formData: FormData) => {
    const result = parseSettingsFormData(formData);
    if (!result.success) {
      setFieldErrors(mapZodErrorsToFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    formAction(formData);
  };

  return (
    <form action={handleAction} className="space-y-8">
      <IntervalInput
        prefix="hard"
        label="難しい（Hard）の復習間隔"
        defaultValue={setting?.hard_interval ?? defaultIntervals.hard}
        error={fieldErrors.hard}
      />

      <IntervalInput
        prefix="uncertain"
        label="曖昧（Uncertain）の復習間隔"
        defaultValue={setting?.uncertain_interval ?? defaultIntervals.uncertain}
        error={fieldErrors.uncertain}
      />

      <IntervalInput
        prefix="easy"
        label="簡単（Easy）の復習間隔"
        defaultValue={setting?.easy_interval ?? defaultIntervals.easy}
        error={fieldErrors.easy}
      />

      {state.errors !== undefined && state.errors.length > 0 && (
        <div className="text-sm text-destructive">
          {state.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? '保存中...' : '設定を保存'}
      </Button>
    </form>
  );
}
