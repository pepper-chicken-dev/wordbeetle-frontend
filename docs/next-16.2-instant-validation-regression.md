# Next.js 16.2 Instant Validation リグレッション調査

## 概要

Next.js を 16.1.3 → 16.2.4 にアップグレードした後、**Google OAuth ログイン直後にヘッダーのユーザーメニュー（アバター）が表示されない**問題が発生した。リロードで表示される。

調査の結果、Next.js 16.2.0-canary.104 で merge された [PR #91208 "Add group depth tracking to instant validation boundary discovery"](https://github.com/vercel/next.js/pull/91208) が原因と判明。本ドキュメントは原因の特定経緯と、Next.js プロジェクトに切り出して検証可能な最小再現手順を残す。

## 症状

- Google OAuth ログインから `/dashboard` にリダイレクトされた直後の **初回レンダリング** で、Header の Suspense（UserMenu）の中身が空になる
- DevTools でブラウザコンソールに `Hydration failed because the server rendered HTML didn't match the client.` が表示される
- ページをリロードすると正常に表示される
- 一度リロードした後にログアウト → 再ログインすると、リダイレクト後でも正常に表示される（=「コールド prerender」状態でだけ発生する）
- ゲストログイン（Credentials Provider）では症状の見え方が異なる（avatar 要素は描画されるが、`/placeholder.svg` 404 のせいで視覚的に空のまま）

## 原因の特定

### Bisect

| バージョン | 再現 |
| --- | --- |
| 16.1.7 | ❌ |
| 16.2.0-canary.50 | ❌ |
| 16.2.0-canary.77 | ❌ |
| 16.2.0-canary.91 | ❌ |
| 16.2.0-canary.98 | ❌ |
| 16.2.0-canary.101 | ❌ |
| 16.2.0-canary.102 | ❌ |
| 16.2.0-canary.103 | ❌ |
| 16.2.0-canary.104 | ✅ |
| 16.2.0 | ✅ |
| 16.2.4 | ✅ |

→ **16.2.0-canary.103 → canary.104 で混入** が確定。

### 該当コミット

canary.103 と canary.104 の差分 6 commit のうち、レンダリングロジックを変更しているのは 1 件のみ:

- **[PR #91208 "Add group depth tracking to instant validation boundary discovery"](https://github.com/vercel/next.js/pull/91208)**
  - 変更ファイル:
    - `packages/next/src/server/app-render/app-render.tsx` (+42, -16)
    - `packages/next/src/server/app-render/instant-validation/instant-validation.tsx` (+117, -10)
    - `packages/next/src/client/components/layout-router.tsx` (+4, -4)
    - `packages/next/src/build/webpack/loaders/next-app-loader/index.ts` (+1, -1)
    - **`crates/next-core/src/app_structure.rs` (+1, -1) ← Rust（Turbopack/SWC ネイティブバイナリ）**
  - PR 説明:
    > Route groups between URL segments were invisible — when a route group layout with Suspense was shared in a client navigation, its Suspense appeared to cover blocking code in the validation render even though it wouldn't in reality.

残り 5 件は Turbopack のプロファイル設定・docs・error message 改善のみで、ランタイム挙動には影響しない。

### 因果関係の確証（dist 差し替え検証）

16.2.4 の `node_modules/next/dist/` のうち PR #91208 が触った JS 系ファイル（CJS / ESM 両方）と、`(__SLOT__)` 定数まで含むコンパイル済みランタイムバンドル（`dist/compiled/next-server/app-page*.runtime.dev.js` 4 ファイル）を canary.103 版に差し替えても**バグは依然として再現**。`discoverValidationDepths` 関数が canary.103 のバンドルに含まれていない（=PR #91208 で追加された関数）ことは確認できたが、JS だけ revert しても症状が消えなかった。

その後 `pnpm dev --webpack` で **Turbopack をバイパスして webpack で起動するとアバターが正常表示**された。これにより:

- **アバター消失の原因 = PR #91208 の Rust crate 部分**（`app_structure.rs` の `(slot)` → `(__SLOT__)` 変更）が SWC ネイティブバイナリ経由で Turbopack の app-router 解決に影響している
- JS 側は付随的な変更で、それ単独では症状を引き起こさない
- 結果的に修正は upstream（Vercel）の Rust 側パッチが必要

なお、ブラウザコンソールに出る `Hydration failed because the server rendered HTML didn't match the client.` エラーは **webpack でも引き続き発生**するため、これは PR #91208 とは無関係の独立した hydration 問題（Radix `DropdownMenu` の `asChild` Slot パターンと React 19 streaming Suspense の組み合わせ）。webpack では React の "tree regenerated on the client" の再構築が成功してアバターが描画される。Turbopack 側ではこの再構築結果も空になることが、Turbopack 由来の app-router 解決バグであることを補強する。

## 効かなかった対症療法

| 試したこと | 結果 |
| --- | --- |
| `connection()` を `auth()` 呼び出しの前に挿入 | ❌ |
| `apiRequest` の `getToken()` 内で `connection()` | ❌ |
| `(authenticated)` route group の layout から `<Suspense>` を外す | ❌ |
| `(authenticated)` route group そのものを削除（pages をフラット化） | ❌ |
| auth チェックを middleware に移動 | ❌ |
| `next.config.ts` の `cacheComponents: true` を無効化 | ❌ |
| `node_modules/next/dist/` の JS ファイル群を canary.103 に差し替え | ❌ |

つまりこのリグレッションは `cacheComponents` や route group の有無とは独立して発生し、JS 側のパッチでは fix できない。Turbopack/SWC ネイティブバイナリに焼き込まれた変更が直接の原因。

## 暫定対応

### 案 A: `next` を 16.1.7 にピン留め（採用）

[PR #77](https://github.com/pepper-chicken-dev/wordbeetle-frontend/pull/77) で採用。

- 16.1 系の最後のリリース。元の upgrade 動機だった CVE 4 件はすべてパッチ済みで、追加で 5 件の CVE が 16.1.3 → 16.1.7 で修正されている
- ただし 16.1 系は今後セキュリティパッチが backport されないため、Next.js 側で本件が修正され次第 16.2.x に再アップグレードする必要がある

### 案 B: dev だけ webpack に切り替える

16.2.x にどうしても上げたい場合、`package.json` の `dev` script を `next dev --webpack` に変更すれば暫定的にバグ回避できる。

- メリット: 16.2.x の追加 CVE パッチ（CVE-2026-23869 など）を享受できる
- デメリット:
  - Turbopack の高速 dev server を捨てることになる（HMR 速度・初回ビルド時間が大きく落ちる）
  - 別の独立した hydration mismatch エラーは webpack でも残る（視覚的な不具合は無いがコンソールがうるさい）
  - Next.js 16 系は今後 webpack を非推奨化する流れにあり、長期解にはならない

## 最小再現手順（Auth.js 不使用）

Google OAuth は外部依存が大きく報告用に持ち回しづらいので、**`auth.js` も外部 IdP も使わずに同等の症状を再現する手順**を以下に示す。本質はリダイレクト時に Cookie をセットし、リダイレクト先のページに `Suspense + Cookie 依存の Server Component` がある状態。

> **注意**: Turbopack 由来のバグなので、`next dev`（デフォルト Turbopack）で起動すること。`--webpack` を指定するとアバターが表示されてしまい、再現できない。

### セットアップ

```bash
pnpm create next-app@16.2.4 next-instant-validation-repro \
  --ts --app --no-tailwind --no-src-dir --no-eslint --no-import-alias
cd next-instant-validation-repro
pnpm add next@16.2.4   # 確実に 16.2.4 にする
```

### `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,  // 元プロジェクトと同条件にしている。再現自体は無くても OK
};

export default nextConfig;
```

### `app/layout.tsx`

```tsx
import { Suspense } from 'react';
import HeaderUserMenu from './header-user-menu';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header
          style={{ display: 'flex', justifyContent: 'space-between', padding: 16 }}
        >
          <strong>Repro</strong>
          <Suspense fallback={<span>loading user…</span>}>
            <HeaderUserMenu />
          </Suspense>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
```

### `app/header-user-menu.tsx`

`auth.js` 相当のサーバ側 Cookie 読み取りを `cookies()` に置き換えた dynamic component。

```tsx
import { cookies } from 'next/headers';

export default async function HeaderUserMenu() {
  const c = await cookies();
  const session = c.get('session')?.value;

  if (session === undefined) {
    return <a href="/login">Login</a>;
  }

  return <span>👤 {session}</span>;
}
```

### `app/page.tsx`

```tsx
export default function Home() {
  return (
    <div>
      <p>Top page</p>
      <a href="/login">Trigger login (sets cookie + redirects to /protected)</a>
    </div>
  );
}
```

### `app/login/route.ts`

OAuth callback 相当。Cookie をセットして `/protected` にリダイレクトする。

```ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/protected', request.url));
  response.cookies.set('session', 'mock-user', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
```

### `app/protected/page.tsx`

```tsx
export default function Protected() {
  return <p>Protected page</p>;
}
```

### 再現手順

1. dev server を停止して `.next` を消す: `rm -rf .next`
2. `pnpm dev`
3. ブラウザで `http://localhost:3000/` を開く
4. **DevTools を開いた状態で** ブラウザの Cookie をすべて削除（再現には必須）
5. `Trigger login (sets cookie + redirects to /protected)` リンクをクリック
6. `/protected` にリダイレクトされる

#### 期待される正常動作

- ヘッダーに `👤 mock-user` が表示される

#### 実際の挙動（バグ）

- ヘッダーが空（Suspense fallback すら出ない、もしくは "loading user…" のまま）
- ブラウザコンソールに `Hydration failed because the server rendered HTML didn't match the client.` のエラー
- ページをリロードすると `👤 mock-user` が表示される
- 一度ログアウト相当（手動で Cookie 削除 → `/login` 再アクセス）すると以降は正常表示

### 確認: 同手順で 16.1.7 では再現しない

```bash
pnpm add next@16.1.7
rm -rf .next
pnpm dev
```

→ 同じ手順で `/login` を踏んでも `/protected` のヘッダーには `👤 mock-user` が即座に表示される。

### 確認: 16.2.4 でも webpack に切り替えると再現しない

```bash
pnpm add next@16.2.4
rm -rf .next
pnpm dev --webpack
```

→ Hydration mismatch エラーは webpack でも残るが、アバター（`👤 mock-user`）は正常表示される。Turbopack ネイティブバイナリ由来のバグであることの追加証拠。

## upstream 報告用テンプレート

issue を立てる場合は以下を含めると良い:

- 上記最小再現リポジトリへのリンク
- bisect 結果（canary.103 vs canary.104）
- 該当 PR: [#91208](https://github.com/vercel/next.js/pull/91208)
- 影響範囲: Turbopack dev mode（webpack dev では再現しない、production の挙動は未検証）
- 切り分け済みの事実:
  - `cacheComponents` 無効、route group 削除、middleware auth でも再現する
  - `node_modules/next/dist/` の JS ファイル（CJS / ESM / コンパイル済みランタイムバンドル含む）を canary.103 版に差し替えても再現する
  - `pnpm dev --webpack` で webpack に切り替えると再現しない
  - → **Rust crate `crates/next-core/src/app_structure.rs` の slot 検出変更（Turbopack/SWC ネイティブバイナリ）が直接の原因**

## 参考

- このリポジトリの[PR #77 (16.1.7 へのピン留め)](https://github.com/pepper-chicken-dev/wordbeetle-frontend/pull/77)
- 同じ 16.2.x 領域の関連リグレッション（別バグだが Suspense / Cookie / リダイレクト周り）:
  - [#93329 router.push inside useActionState breaks Back button when proxy.ts emits Set-Cookie](https://github.com/vercel/next.js/issues/93329)
  - [#92907 Router state header was sent but could not be parsed on soft navigation with dynamic rendering](https://github.com/vercel/next.js/issues/92907)
  - [#92961 Router state header could not be parsed during version skew (v15 => v16.2)](https://github.com/vercel/next.js/issues/92961)
