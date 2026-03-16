'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">エラーが発生しました</h2>
        <p className="text-muted-foreground">
          データの読み込みに失敗しました
        </p>
        <Button onClick={reset}>再試行</Button>
      </div>
    </div>
  );
}
