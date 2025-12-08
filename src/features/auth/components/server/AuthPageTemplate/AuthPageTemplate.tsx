import { AuthForm } from '@/components/auth-form';

export function AuthPageTemplate() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary to-muted">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}
