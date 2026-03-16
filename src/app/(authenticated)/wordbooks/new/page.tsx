import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WordbookForm } from '@/components/wordbook/wordbook-form';
import { auth } from '@/lib/auth';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '新しい単語帳 | WordBeetle',
};

async function NewWordbookContent() {
  const session = await auth();
  const userId = session?.user?.apiUserId;

  if (userId === undefined) {
    redirect('/auth');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しい単語帳を作成</CardTitle>
      </CardHeader>
      <CardContent>
        <WordbookForm userId={userId} />
      </CardContent>
    </Card>
  );
}

export default function NewWordbookPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Suspense fallback={<Skeleton className="h-48 rounded-lg" />}>
          <NewWordbookContent />
        </Suspense>
      </div>
    </div>
  );
}
