import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { migrateGuestToGoogleAction } from '@/lib/actions/guest-actions';
import { signOutAction } from '@/lib/auth/actions';
import Link from 'next/link';
import { GuestSignOutDialog } from './guest-sign-out-dialog';

type UserMenuPresenterProps = {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  isGuest: boolean;
};

export function UserMenuPresenter({
  name,
  email,
  image,
  isGuest,
}: UserMenuPresenterProps) {
  if (name === null || name === undefined) {
    return (
      <Button asChild variant="ghost">
        <Link href="/auth">ログイン</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="w-10 h-10 cursor-pointer">
            <AvatarImage
              src={image ?? '/placeholder.svg'}
              alt={name ?? 'User'}
            />
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            {isGuest ? (
              <Badge variant="secondary" className="text-xs w-fit">
                ゲスト
              </Badge>
            ) : (
              <p className="text-sm font-medium">{name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {isGuest ? '7日間の有効期限があります' : email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">ダッシュボード</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">設定</Link>
        </DropdownMenuItem>
        {isGuest && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={migrateGuestToGoogleAction} className="w-full">
                <button type="submit" className="w-full text-left">
                  Googleで登録
                </button>
              </form>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        {isGuest ? (
          <GuestSignOutDialog />
        ) : (
          <DropdownMenuItem asChild>
            <form action={signOutAction} className="w-full">
              <button type="submit" className="w-full text-left">
                ログアウト
              </button>
            </form>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
