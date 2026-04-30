'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Interval } from '@/types/api';

type IntervalInputProps = {
  prefix: string;
  label: string;
  defaultValue?: Interval | null;
  error?: string;
};

export function IntervalInput({
  prefix,
  label,
  defaultValue,
  error,
}: IntervalInputProps) {
  const errorId = `${prefix}-error`;
  const hasError = error !== undefined && error !== '';
  const ariaDescribedBy = hasError ? errorId : undefined;
  const ariaInvalid = hasError ? true : undefined;

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            name={`${prefix}_days`}
            min={0}
            defaultValue={defaultValue?.days ?? 0}
            className="w-20"
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
          <span className="text-sm text-muted-foreground">日</span>
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            name={`${prefix}_hours`}
            min={0}
            max={23}
            defaultValue={defaultValue?.hours ?? 0}
            className="w-20"
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
          <span className="text-sm text-muted-foreground">時間</span>
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            name={`${prefix}_minutes`}
            min={0}
            max={59}
            defaultValue={defaultValue?.minutes ?? 0}
            className="w-20"
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
          <span className="text-sm text-muted-foreground">分</span>
        </div>
      </div>
      {hasError && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
