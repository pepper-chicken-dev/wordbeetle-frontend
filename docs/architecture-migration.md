# アーキテクチャ移行: Feature-based → フラット構成

## 概要

Feature-based 構成（`features/` + `shared/`）から、Vercel Commerce 等で広く使われる標準的な Next.js 構成（`components/` + `lib/`）へ移行した。

**目的**: Next.js エコシステムの慣習に合わせ、保守性・開発者体験を向上させる。

## ディレクトリ構成

### Before

```
src/
├── app/
├── features/
│   └── auth/
│       ├── actions/
│       │   ├── sign-in.action.ts
│       │   └── sign-out.action.ts
│       ├── components/server/
│       │   ├── AuthForm/
│       │   │   ├── AuthForm.tsx
│       │   │   └── index.ts
│       │   ├── AuthPageTemplate/
│       │   │   ├── AuthPageTemplate.tsx
│       │   │   └── index.ts
│       │   └── ProviderIcon/
│       │       ├── ProviderIcon.tsx
│       │       └── index.ts
│       ├── lib/
│       │   ├── auth.ts
│       │   └── providers.ts
│       └── types/
│           └── next-auth.d.ts
├── shared/
│   ├── components/
│   │   ├── layout/server/
│   │   │   └── Header/
│   │   │       ├── Header.tsx
│   │   │       ├── index.ts
│   │   │       └── UserMenu/
│   │   │           ├── UserMenu.tsx
│   │   │           ├── UserMenuContainer.tsx
│   │   │           ├── UserMenuPresenter.tsx
│   │   │           └── index.ts
│   │   └── ui/
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── dropdown-menu.tsx
│   └── lib/
│       └── utils.ts
└── middleware.ts
```

### After

```
src/
├── app/                              # 変更なし（import パスのみ更新）
├── components/
│   ├── auth/
│   │   ├── auth-form.tsx             # 認証フォーム（OAuth ボタン一覧）
│   │   ├── auth-page-template.tsx    # 認証ページのレイアウトラッパー
│   │   └── provider-icon.tsx         # OAuth プロバイダーアイコン
│   ├── layout/
│   │   ├── header.tsx                # ナビゲーションバー
│   │   ├── user-menu.tsx             # Container: セッション取得
│   │   └── user-menu-presenter.tsx   # Presenter: UI 描画（'use cache'）
│   └── ui/                           # shadcn/ui プリミティブ（4ファイル）
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── dropdown-menu.tsx
├── lib/
│   ├── auth/
│   │   ├── index.ts                  # NextAuth 設定・エクスポート
│   │   ├── providers.ts              # OAuth プロバイダー定義
│   │   └── actions.ts                # Server Actions（signIn / signOut）
│   └── utils.ts                      # cn() ヘルパー（clsx + tailwind-merge）
├── types/
│   └── next-auth.d.ts                # Session / JWT 型拡張
└── middleware.ts                      # 認証ガード
```

## 変更内容の詳細

### 1. 命名規則の変更

| 項目 | Before | After |
|------|--------|-------|
| フォルダ名 | PascalCase (`AuthForm/`) | kebab-case (`auth-form.tsx`) |
| ファイル名 | PascalCase (`AuthForm.tsx`) | kebab-case (`auth-form.tsx`) |
| barrel export | `index.ts` で再エクスポート | 直接 import（barrel export 廃止） |

### 2. Server Actions の統合

`sign-in.action.ts` と `sign-out.action.ts` の 2 ファイルを `lib/auth/actions.ts` に統合。

```typescript
// Before
import { signInAction } from '@/features/auth/actions/sign-in.action';
import { signOutAction } from '@/features/auth/actions/sign-out.action';

// After
import { signInAction, signOutAction } from '@/lib/auth/actions';
```

### 3. Container/Presenter パターンの維持

UserMenu の Container/Presenter 分離はそのまま維持。ファイル名とエクスポート名のみ変更。

| Before | After |
|--------|-------|
| `UserMenuContainer.tsx` → `UserMenu.tsx` (barrel) で再エクスポート | `user-menu.tsx` が直接 `UserMenu` をエクスポート |
| `UserMenuPresenter.tsx` | `user-menu-presenter.tsx` |

Container の export 名は `UserMenuContainer` → `UserMenu` に変更し、外部から自然に import できるようにした。

### 4. `components/server/` サブディレクトリの廃止

Next.js では Server Component がデフォルトのため、`server/` サブディレクトリは不要。コンポーネントは `components/auth/`、`components/layout/` に直接配置。

### 5. shadcn/ui との整合

`components.json` の aliases 設定は元々以下を期待していた:

```json
{
  "components": "@/components",
  "ui": "@/components/ui",
  "lib": "@/lib",
  "utils": "@/lib/utils"
}
```

移行前は実際のファイルが `shared/components/ui/` や `shared/lib/utils` にあり不整合だったが、移行後は aliases と実際の配置が一致するようになった。

## 全 import パス変更一覧

| Before | After | 使用箇所 |
|--------|-------|---------|
| `@/shared/lib/utils` | `@/lib/utils` | `components/ui/*.tsx` (4 ファイル) |
| `@/shared/components/ui/*` | `@/components/ui/*` | `auth-form.tsx`, `user-menu-presenter.tsx` |
| `@/shared/components/layout/server/Header` | `@/components/layout/header` | `app/layout.tsx` |
| `@/features/auth/lib/auth` | `@/lib/auth` | `middleware.ts`, `route.ts`, `user-menu.tsx` |
| `@/features/auth/lib/providers` | `@/lib/auth/providers` | `auth-form.tsx`, `actions.ts` |
| `@/features/auth/actions/sign-in.action` | `@/lib/auth/actions` | `auth-form.tsx` |
| `@/features/auth/actions/sign-out.action` | `@/lib/auth/actions` | `user-menu-presenter.tsx` |
| `@/features/auth/components/server/AuthPageTemplate` | `@/components/auth/auth-page-template` | `app/auth/page.tsx` |
| `@/features/auth/components/server/AuthForm` | `@/components/auth/auth-form` | `auth-page-template.tsx` |
| `@/features/auth/components/server/ProviderIcon` | `@/components/auth/provider-icon` | `auth-form.tsx` |

## 注意事項

### 新規コンポーネント追加時のルール

- **ファイル名は kebab-case** を使用する（例: `my-component.tsx`）
- **barrel export (`index.ts`) は使わない** — ファイルから直接 import する
- **`components/ui/`** には shadcn/ui コンポーネントのみ配置する。`npx shadcn@latest add` で追加すれば自動的に正しい場所に配置される
- **Server Component がデフォルト** — `'use client'` は対話性が必要な場合のみ付与する

### Container/Presenter を追加する場合

```
components/
└── layout/
    ├── my-widget.tsx             # Container: データ取得（async Server Component）
    └── my-widget-presenter.tsx   # Presenter: UI 描画（'use cache' 付き）
```

Container が外部向けの名前（`MyWidget`）をエクスポートし、Presenter は Container からのみ import される。

### lib/ にロジックを追加する場合

ドメインごとにサブディレクトリを作成する:

```
lib/
├── auth/          # 認証関連
│   ├── index.ts   # メインエクスポート
│   ├── providers.ts
│   └── actions.ts
└── utils.ts       # 汎用ユーティリティ
```

`lib/{domain}/index.ts` をエントリポイントとし、`@/lib/{domain}` で import できるようにする。

### 削除されたファイル

以下のファイルは移行に伴い削除された（barrel export）:

- `src/features/auth/components/server/AuthForm/index.ts`
- `src/features/auth/components/server/AuthPageTemplate/index.ts`
- `src/features/auth/components/server/ProviderIcon/index.ts`
- `src/shared/components/layout/server/Header/index.ts`
- `src/shared/components/layout/server/Header/UserMenu/index.ts`
- `src/shared/components/layout/server/Header/UserMenu/UserMenu.tsx`

## 検証結果

- `pnpm build` — 正常にビルド完了
- `pnpm lint` — lint エラーなし
