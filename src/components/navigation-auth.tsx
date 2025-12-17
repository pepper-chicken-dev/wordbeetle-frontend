import { Button } from '@/components/ui/button';
import { auth } from '@/features/auth/lib/auth';
import Link from 'next/link';
import { UserMenu } from './user-menu';

export async function NavigationAuth() {
  const session = await auth();

  return (
    <>
      {session?.user !== null && session?.user !== undefined ? (
        <UserMenu session={session} />
      ) : (
        <Button asChild variant="ghost">
          <Link href="/auth">ログイン</Link>
        </Button>
      )}
    </>
  );
}
