# MVP Core Features 実装レビューガイド

`feat/mvp-core-features` ブランチで実装された変更の概要と、各ファイルの役割を説明するドキュメントです。

## 変更概要

| カテゴリ | 新規ファイル数 | 変更ファイル数 |
|---------|-------------|-------------|
| ルーティング (`app/`) | 17 | 2 |
| コンポーネント (`components/`) | 22 | 1 |
| API・ロジック (`lib/`) | 11 | 2 |
| 型定義 (`types/`) | 1 | 1 |
| UI プリミティブ (`components/ui/`) | 9 | 1 |
| 設定ファイル | 0 | 3 |

---

## 1. 既存ファイルの変更

レビュー時にまず確認すべき差分です。

### `src/lib/auth/index.ts`

**変更内容**: NextAuth 設定にゲスト認証（Credentials provider）を追加。

- `Credentials` provider を `id: 'guest'` で登録
- `createGuestUser()` で Rails API にゲストユーザ作成をリクエスト
- JWT callback でゲストサインイン時に `idToken` と `apiUserId` を格納
- OAuth サインイン時にも `apiUserId` を API レスポンスから取得して格納するよう変更

**レビューポイント**:
- ゲスト認証と OAuth 認証が JWT callback 内で分岐している。`account?.provider === 'guest'` で早期リターンし、それ以外は既存の OAuth フローを通る構造
- `session` callback で `apiUserId` を公開するよう追加

### `src/types/next-auth.d.ts`

**変更内容**: JWT と Session の型に `apiUserId?: number` を追加。

### `src/components/auth/auth-form.tsx`

**変更内容**: ログインフォームに「ゲストとして始める」ボタンを追加。

- `signInAsGuestAction` を呼ぶ `<form>` を追加
- セパレーター（「または」）で OAuth ボタンと区切り
- 「ゲストデータは7日間保持されます」の注意書き追加

### `src/lib/auth/actions.ts`

**変更内容**: サインイン後のリダイレクト先を `/` → `/dashboard` に変更。

### `src/middleware.ts`

**変更内容**: 認証済みユーザの `/auth` アクセス時のリダイレクト先を `/` → `/dashboard` に変更。

### `src/app/page.tsx`

**変更内容**: ランディングページに認証チェックを追加。認証済みなら `/dashboard` へリダイレクト。Next.js 16 PPR に対応するため `<Suspense>` でラップ。

### `src/app/layout.tsx`

**変更内容**: `<Toaster />` (sonner) をルートレイアウトに追加。全画面でトースト通知が利用可能に。

### `package.json`

**変更内容**: `next-themes`, `radix-ui`, `sonner` が依存に追加（shadcn/ui コンポーネント追加に伴う）。

---

## 2. 型定義・APIクライアント層

### `src/types/api.ts` (新規)

OpenAPI スキーマに対応する TypeScript 型の定義。

| 型名 | 用途 |
|------|------|
| `WordStatus` | `'not_studied' \| 'hard' \| 'uncertain' \| 'easy'` |
| `Interval` | `{ days, hours, minutes }` — SRS 復習間隔 |
| `User`, `Wordbook`, `Word`, `Meaning`, `Example`, `Setting` | 各リソースのレスポンス型 |
| `Create*Input`, `Update*Input` | リクエストボディ型 |
| `ValidationErrors`, `ApiError` | エラーレスポンス型 |

**レビューポイント**: OpenAPI (`docs/openapi.yaml`) のスキーマと一致しているか確認。

### `src/lib/api/client.ts` (新規)

`fetch` ベースの API クライアント。

- `auth()` からトークンを取得し `Authorization: Bearer` ヘッダーに付与
- `ApiError` クラスでステータスコード + ボディを保持
- 204 No Content を `undefined` として返却
- `API_URL` 環境変数が未設定の場合はエラーをスロー

**レビューポイント**:
- エラーレスポンスの JSON パースに失敗した場合は `null` にフォールバック
- 全リクエストに認証ヘッダーを付与する設計（ゲストトークンも同じ仕組み）

### `src/lib/api/wordbooks.ts` / `words.ts` / `meanings.ts` / `examples.ts` / `settings.ts` (新規)

各リソースの CRUD 関数。全て `apiRequest` を使い、Rails convention の `{ resource_name: {...} }` 形式でボディを送信。

### `src/lib/api/guest-auth.ts` (新規)

`POST {API_URL}/auth/guest` を呼んでゲストユーザとトークンを取得。`auth()` を使わない（認証前のため）。

---

## 3. Server Actions

### `src/lib/actions/wordbook-actions.ts` (新規)

| アクション | 説明 |
|-----------|------|
| `createWordbookAction` | フォームからタイトルと userId を受け取り、単語帳を作成。成功時は `/wordbooks/{id}` へリダイレクト |
| `updateWordbookAction` | タイトルを更新。成功時は単語帳詳細へリダイレクト |
| `deleteWordbookAction` | 単語帳を削除。成功時は `/dashboard` へリダイレクト |

`useActionState` 対応の `(prevState, formData) => ActionResult` シグネチャ。`revalidatePath` で関連パスを再検証。

### `src/lib/actions/word-actions.ts` (新規)

| アクション | 説明 |
|-----------|------|
| `createWordAction` | spelling + meaning + example を一括作成。Word → Meaning → Example の順で API を呼ぶ |
| `updateWordAction` | 既存の meaning/example があれば更新、なければ新規作成 |
| `updateWordStatusAction` | ステータスのみ更新（手動変更用） |
| `deleteWordAction` | 単語を削除 |
| `evaluateWordAction` | テストの自己評価を処理。Settings API からユーザの復習間隔を取得し、`next_review_at` を計算して Word を更新 |

**レビューポイント**:
- `createWordAction` / `updateWordAction` はトランザクション的でないため、途中で失敗すると不整合が生じる可能性がある（P0 では許容）
- `evaluateWordAction` のデフォルト間隔: hard=1日, uncertain=3日, easy=7日

### `src/lib/actions/settings-actions.ts` (新規)

`saveSettingsAction` — 設定が存在すれば更新、なければ新規作成。

### `src/lib/actions/guest-actions.ts` (新規)

`signInAsGuestAction` — NextAuth の `signIn('guest')` を呼んでゲストログイン。

---

## 4. ルーティング (`app/`)

### `src/app/(authenticated)/layout.tsx` (新規)

認証ガード。`auth()` でセッションを取得し、未認証なら `/auth` へリダイレクト。`<Suspense>` でラップ（PPR 対応）。

### ダッシュボード

| ファイル | 役割 |
|---------|------|
| `dashboard/page.tsx` | 単語帳一覧ページ。`<WordbookList>` を `<Suspense>` でラップ |
| `dashboard/loading.tsx` | Skeleton ローディング UI |
| `dashboard/error.tsx` | エラーバウンダリ（再試行ボタン付き） |

### 単語帳

| ファイル | 役割 |
|---------|------|
| `wordbooks/new/page.tsx` | 単語帳作成。`auth()` から `userId` を取得して `<WordbookForm>` に渡す |
| `wordbooks/[wordbookId]/page.tsx` | 単語帳詳細ページのシェル。searchParams からフィルタを抽出し `<WordbookDetailContent>` に委譲 |
| `wordbooks/[wordbookId]/wordbook-detail-content.tsx` | 実際のデータ取得・描画（`getWordbook` → タイトル表示、操作ボタン、フィルタバー、単語一覧） |
| `wordbooks/[wordbookId]/edit/page.tsx` | 単語帳編集。既存データをフェッチして `<WordbookForm>` に渡す |
| `wordbooks/[wordbookId]/loading.tsx` | Skeleton |
| `wordbooks/[wordbookId]/error.tsx` | エラーバウンダリ |
| `wordbooks/[wordbookId]/not-found.tsx` | 存在しない単語帳の表示 |

### 単語

| ファイル | 役割 |
|---------|------|
| `words/new/page.tsx` | 単語登録ページ |
| `words/[wordId]/page.tsx` | 単語詳細ページのシェル |
| `words/[wordId]/word-detail-content.tsx` | 単語・意味・例文をフェッチして `<WordDetail>` に描画 |
| `words/[wordId]/edit/page.tsx` | 単語編集。既存の meaning/example もフェッチしてフォームに渡す |

### テスト

| ファイル | 役割 |
|---------|------|
| `test/page.tsx` | `next_review_at` が過去 or null の単語をフィルタし、`<FlashcardTest>` に渡す |

### 設定

| ファイル | 役割 |
|---------|------|
| `settings/page.tsx` | SRS 復習間隔の設定ページ。既存設定をフェッチして `<SettingsForm>` に渡す |

---

## 5. コンポーネント

### `components/wordbook/` (新規)

| ファイル | Client/Server | 説明 |
|---------|--------------|------|
| `wordbook-list.tsx` | Server | `listWordbooks()` でデータ取得、カードをグリッド表示 |
| `wordbook-card.tsx` | Server | 単語帳カード。タイトル、作成日、BookOpen アイコン |
| `wordbook-form.tsx` | Client | `useActionState` で作成/編集フォーム。タイトル入力 |
| `wordbook-delete-dialog.tsx` | Client | AlertDialog + `useTransition` で削除確認 |

### `components/word/` (新規)

| ファイル | Client/Server | 説明 |
|---------|--------------|------|
| `word-list.tsx` | Server | 全単語・意味を取得し、`wordbook_id` / `status` / `query` でフィルタ |
| `word-card.tsx` | Server | 単語名 + 最初の意味 + ステータスバッジ |
| `word-status-badge.tsx` | Server | ステータスに応じた色付き Badge (gray/red/yellow/green) |
| `word-form.tsx` | Client | spelling + 意味 + 例文(文+訳) の入力フォーム。音声ボタン付き |
| `word-detail.tsx` | Server | 単語の spelling、ステータス、意味一覧、例文一覧、次回復習日、音声ボタンを表示 |
| `word-filter-bar.tsx` | Client | Tabs（ステータスフィルタ）+ Input（検索）。URL search params を更新 |
| `word-delete-dialog.tsx` | Client | AlertDialog で単語削除確認 |

**レビューポイント**:
- `word-list.tsx` はクライアントサイドフィルタリング。API にフィルタパラメータがないため全件取得 → メモリ上でフィルタ
- `word-filter-bar.tsx` は `useRouter().push()` で URL パラメータを書き換え、Server Component の再レンダリングを誘発

### `components/test/` (新規)

| ファイル | Client/Server | 説明 |
|---------|--------------|------|
| `flashcard.tsx` | Client | カード表面（spelling + 音声）/ 裏面（意味 + 例文）。クリックで反転 |
| `flashcard-test.tsx` | Client | テストセッション管理。`currentIndex` で進行、`evaluateWordAction` を呼んで次の問題へ |
| `self-evaluation-buttons.tsx` | Client | 「難しい」「曖昧」「簡単」の3ボタン |
| `test-complete.tsx` | Server | テスト完了画面。合計問題数と戻るリンク |

### `components/audio/` (新規)

| ファイル | Client/Server | 説明 |
|---------|--------------|------|
| `audio-play-button.tsx` | Client | Web Speech API (`speechSynthesis`) で英語発音。`text` props または `textSelector` で発音対象を指定 |

**レビューポイント**: `textSelector` は DOM セレクタで input 要素の `value` も取得可能（登録フォームで利用）

### `components/settings/` (新規)

| ファイル | Client/Server | 説明 |
|---------|--------------|------|
| `settings-form.tsx` | Client | hard/uncertain/easy の間隔を入力。`useActionState` + `useEffect` で成功時トースト表示 |
| `interval-input.tsx` | Client | 日・時間・分の3つの数値入力。`prefix` で name 属性を分離 |

### `components/ui/` (新規 9ファイル)

shadcn/ui からの追加: `alert-dialog`, `badge`, `input`, `label`, `separator`, `skeleton`, `sonner`, `tabs`, `textarea`

---

## 6. 設計上の判断とトレードオフ

### Next.js 16 PPR (Partial Prerender) 対応

- 全ての非同期データ取得は `<Suspense>` 境界内に配置
- ページコンポーネントは薄いシェルとし、データ取得は子の Server Component（`*-content.tsx`）に委譲
- `loading.tsx` は Suspense フォールバックとは別に、ルートセグメント単位の遷移用

### 認証フロー

- ゲスト認証は NextAuth の Credentials provider を使い、OAuth と同一の JWT フローで処理
- `apiUserId` を JWT に格納することで、Server Action から Rails API へのリクエスト時にユーザ ID を利用可能

### クライアントサイドフィルタリング

- Rails API が `words` エンドポイントにフィルタパラメータを提供していないため、全件取得後にクライアント（Server Component 内）でフィルタ
- 大量データ時のパフォーマンス懸念あり → API 側フィルタ対応後に移行予定

### 単語作成の一括処理

- `createWordAction` は Word → Meaning → Example の3回の API コールを直列実行
- トランザクション保証なし。部分的に作成された場合のリカバリーは未実装（MVP 許容）

---

## 7. レビュー時の確認チェックリスト

- [ ] `lib/auth/index.ts`: ゲスト認証フローと OAuth フローの分岐が正しいか
- [ ] `lib/api/client.ts`: エラーハンドリング、トークン取得失敗時の挙動
- [ ] `lib/actions/word-actions.ts`: `evaluateWordAction` の SRS 計算ロジック（デフォルト間隔、Settings からの読み取り）
- [ ] `components/auth/auth-form.tsx`: ゲストボタンの UX、セパレーターの配置
- [ ] `components/word/word-list.tsx`: クライアントサイドフィルタのロジック（ステータス + テキスト検索）
- [ ] `components/test/flashcard-test.tsx`: テストセッションの状態管理、評価後の遷移
- [ ] 全ページの `<Suspense>` ラップが正しいか
- [ ] 全 Server Action の `revalidatePath` が適切なパスを対象にしているか
- [ ] `types/api.ts` と `docs/openapi.yaml` の整合性
