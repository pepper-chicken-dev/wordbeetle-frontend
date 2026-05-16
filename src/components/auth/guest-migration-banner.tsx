import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { migrateGuestToGoogleAction } from '@/lib/actions/guest-actions';
import { getOptionalSession } from '@/lib/dal/session';
import { FcGoogle } from 'react-icons/fc';

export async function GuestMigrationBanner() {
  const session = await getOptionalSession();

  if (session?.user?.isGuest !== true) {
    return null;
  }

  return (
    <Card className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-100">
            ゲストアカウントをご利用中です
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            ゲストアカウントには7日間の有効期限があります。Googleアカウントで登録すると、データを永続的に保存できます。
          </p>
        </div>
        <form action={migrateGuestToGoogleAction}>
          <Button
            type="submit"
            variant="outline"
            className="shrink-0 border-amber-400 text-amber-900 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-100 dark:hover:bg-amber-900"
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Googleで登録
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
