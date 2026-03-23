'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { migrateGuestToGoogleAction } from '@/lib/actions/guest-actions';
import { signOutAction } from '@/lib/auth/actions';
import { useTransition } from 'react';

export function GuestSignOutDialog() {
  const [isMigrating, startMigration] = useTransition();
  const [isSigningOut, startSignOut] = useTransition();

  function handleMigrate() {
    startMigration(async () => {
      await migrateGuestToGoogleAction();
    });
  }

  function handleSignOut() {
    startSignOut(async () => {
      await signOutAction();
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          ログアウト
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
          <AlertDialogDescription>
            ゲストアカウントのデータは再ログインで復元できません。Googleアカウントで登録すると、データを永続的に保存できます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleMigrate}
            disabled={isMigrating || isSigningOut}
          >
            {isMigrating ? '処理中...' : 'Googleで登録'}
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleSignOut}
            disabled={isMigrating || isSigningOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSigningOut ? 'ログアウト中...' : 'ログアウト'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
