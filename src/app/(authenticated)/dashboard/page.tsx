import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WordbookList } from '@/components/wordbook/wordbook-list';
import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'ダッシュボード | WordBeetle',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">単語帳</h1>
          <Button asChild>
            <Link href="/wordbooks/new">
              <Plus className="mr-2 h-4 w-4" />
              新しい単語帳
            </Link>
          </Button>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          }
        >
          <WordbookList />
        </Suspense>
      </div>
    </div>
  );
}
