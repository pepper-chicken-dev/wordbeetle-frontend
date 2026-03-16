import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user === null || session?.user === undefined) {
    redirect('/auth');
  }

  return <>{children}</>;
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}
