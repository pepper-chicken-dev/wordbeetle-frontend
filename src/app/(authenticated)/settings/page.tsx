import { AccountDeletionCard } from '@/components/settings/account-deletion-card';
import { SettingsForm } from '@/components/settings/settings-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { verifySession } from '@/lib/dal/session';
import { getSettingView } from '@/lib/dto/setting';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '設定 | WordBeetle',
};

async function SettingsContent() {
  const setting = (await getSettingView()) ?? undefined;
  const { isGuest } = await verifySession();

  return (
    <div className="space-y-6">
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
      {!isGuest && <AccountDeletionCard />}
    </div>
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
