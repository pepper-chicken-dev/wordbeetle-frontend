import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WordbookNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">単語帳が見つかりません</h2>
        <p className="text-muted-foreground">
          指定された単語帳は存在しないか、削除されています
        </p>
        <Button asChild>
          <Link href="/dashboard">ダッシュボードに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
