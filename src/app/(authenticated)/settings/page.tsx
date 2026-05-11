import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsForm } from '@/components/settings/settings-form';
import { ApiError } from '@/lib/dal/client';
import { getSetting } from '@/lib/dal/settings';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '設定 | WordBeetle',
};

async function SettingsContent() {
  let setting;
  try {
    setting = await getSetting();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      setting = undefined;
    } else {
      throw error;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>復習間隔</CardTitle>
        <CardDescription>
          テストの自己評価に応じた復習間隔を設定します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsForm setting={setting} />
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">設定</h1>
        <Suspense fallback={<Skeleton className="h-64 rounded-lg" />}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
}
