import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary to-muted">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
