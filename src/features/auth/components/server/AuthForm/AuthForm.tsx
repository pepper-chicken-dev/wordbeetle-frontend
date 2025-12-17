import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signInAction } from '@/features/auth/actions/sign-in.action';
import { ProviderIcon } from '@/features/auth/components/server/ProviderIcon';
import { providerMap } from '@/lib/auth';
import Image from 'next/image';

export function AuthForm() {
  return (
    <Card className="border-2 shadow-2xl">
      <CardHeader className="space-y-4 text-center pb-8">
        <div className="flex justify-center mb-2">
          <Image
            src="/logo.svg"
            alt="WordBeetle Logo"
            width={60}
            height={60}
            className="rounded-md"
          />
        </div>
        <div>
          <CardTitle className="text-3xl font-bold text-balance">
            WordBeetle
          </CardTitle>
          <CardDescription className="text-base mt-3 text-balance">
            新規登録またはログイン
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pb-8">
        <div className="space-y-4">
          {Object.values(providerMap).map((provider) => (
            <form key={provider.id} action={signInAction}>
              <input type="hidden" name="providerId" value={provider.id} />
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium border-2 hover:bg-secondary hover:border-primary transition-all duration-200 relative flex items-center justify-center"
              >
                <ProviderIcon
                  providerId={provider.id}
                  size={30}
                  className="absolute left-4"
                />
                <span>{provider.name}で続ける</span>
              </Button>
            </form>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground">
              シンプル・安全・高速
            </span>
          </div>
        </div>
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3 text-accent-foreground"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              <strong className="font-semibold">簡単アクセス</strong>
              <br />
              Googleアカウントでワンクリックログイン
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3 text-accent-foreground"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              <strong className="font-semibold">安心セキュリティ</strong>
              <br />
              Googleの強固な認証システム
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          ログインすることで、
          <a
            href="#"
            className="underline hover:text-foreground transition-colors"
          >
            利用規約
          </a>
          および
          <a
            href="#"
            className="underline hover:text-foreground transition-colors"
          >
            プライバシーポリシー
          </a>
          に同意したものとみなされます
        </p>
      </CardContent>
    </Card>
  );
}
