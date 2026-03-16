'use client';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const statusTabs: { value: string; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'not_studied', label: '未学習' },
  { value: 'hard', label: '難しい' },
  { value: 'uncertain', label: '曖昧' },
  { value: 'easy', label: '簡単' },
];

export function WordFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') ?? 'all';
  const currentQuery = searchParams.get('q') ?? '';

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const queryString = params.toString();
      router.push(queryString !== '' ? `?${queryString}` : '?');
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-4">
      <Tabs
        value={currentStatus}
        onValueChange={(value) => updateParams('status', value)}
      >
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="単語や意味で検索..."
          defaultValue={currentQuery}
          onChange={(e) => updateParams('q', e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
