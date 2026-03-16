import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Wordbook } from '@/types/api';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

type WordbookCardProps = {
  wordbook: Wordbook;
};

export function WordbookCard({ wordbook }: WordbookCardProps) {
  const createdAt = new Date(wordbook.created_at).toLocaleDateString('ja-JP');

  return (
    <Link href={`/wordbooks/${wordbook.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {wordbook.title}
              </CardTitle>
              <CardDescription className="mt-1">
                作成日: {createdAt}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
