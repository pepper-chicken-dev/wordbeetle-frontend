import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { NavigationAuth } from './navigation-auth';

export function Navigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.svg"
            alt="WordBeetle Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <span className="font-bold text-xl">WordBeetle</span>
        </Link>

        <div className="flex items-center gap-4">
          <Suspense
            fallback={
              <div className="w-10 h-10 rounded-full bg-muted/50 border-2 border-border animate-pulse" />
            }
          >
            <NavigationAuth />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
