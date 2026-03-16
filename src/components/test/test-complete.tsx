import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type TestCompleteProps = {
  wordbookId: number;
  totalCount: number;
};

export function TestComplete({ wordbookId, totalCount }: TestCompleteProps) {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">テスト完了！</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-muted-foreground">
          {totalCount}問のテストを完了しました
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href={`/wordbooks/${wordbookId}`}>単語帳に戻る</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">ダッシュボード</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
