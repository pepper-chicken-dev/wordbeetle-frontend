# フロントエンド ↔ バックエンド API 仕様の差分一覧

`docs/openapi.yaml` を正として、フロントエンド側がまだ追従できていない箇所をまとめる。
カテゴリ別に「Critical(動作不能)」「High(レスポンス読み違い)」「Medium(型定義の余剰/最適化漏れ)」で分類した。

---

## Critical — このままでは動かない

### 1. Examples エンドポイントのパスが Meaning ネストになっていない

OpenAPI:

```
/api/v1/wordbooks/{wordbook_id}/words/{word_id}/meanings/{meaning_id}/examples
/api/v1/wordbooks/{wordbook_id}/words/{word_id}/meanings/{meaning_id}/examples/{id}
```

フロント実装(`src/lib/api/examples.ts`):

```
/wordbooks/${wordbookId}/words/${wordId}/examples
/wordbooks/${wordbookId}/words/${wordId}/examples/${id}
```

→ `meaning_id` がパスに含まれていないため、Examples の CRUD が全て 404。
- `src/lib/api/examples.ts:8-63` の全関数シグネチャに `meaningId` を追加
- 呼び出し側 `src/lib/actions/word-actions.ts:23,52,82,123,134` も `meaningId` を渡すよう修正

---

### 2. `Meaning` のフィールド名 `content` → `definition`

OpenAPI `Meaning.definition` (`openapi.yaml:1052`)。フロントは `content` 前提。

影響箇所:
- `src/types/api.ts:42` — 型定義 `content: string`
- `src/types/api.ts:101,106` — `Create/UpdateMeaningInput.content`
- `src/lib/actions/word-actions.ts:41,106,111` — リクエストボディに `content` を送信
- `src/components/word/word-detail.tsx:29` — `meaning.content` 表示
- `src/components/word/word-card.tsx:21` — `meaning.content` 表示
- `src/components/test/flashcard.tsx:43` — `meaning.content` 表示
- `src/components/word/word-list.tsx:28` — `first_meaning.content` 検索

→ 送信時/表示時とも全滅。`definition` に統一。

---

### 3. `WordWithRelations` / `TestWordsResponse` の examples が meaning にネストされる

OpenAPI:

```yaml
WordWithRelations:
  meanings:
    - definition, display_order
      examples: [ ... ]   # meaning にネスト
```

フロント `src/types/api.ts:52-55`:

```ts
export type WordWithDetails = Word & {
  meanings: Meaning[];
  examples: Example[];   # word 直下に flat
};
```

影響箇所:
- `src/types/api.ts:52-60` — `WordWithDetails` / `TestWordsResponse.words` の型
- `src/app/(authenticated)/wordbooks/[wordbookId]/test/page.tsx:28-39` — `{ meanings, examples, ...word }` 分解
- `src/app/(authenticated)/wordbooks/[wordbookId]/words/[wordId]/word-detail-content.tsx:29-31,59` — `word.examples.sort(...)`
- `src/app/(authenticated)/wordbooks/[wordbookId]/words/[wordId]/edit/page.tsx:39` — `word.examples.sort(...)`
- `src/components/word/word-detail.tsx:9,12,36,44` — `examples` を独立 prop で受け取り
- `src/components/test/flashcard.tsx:11,14,48,50` — 同上
- `src/components/test/flashcard-test.tsx:14,79` — `examples` を独立 prop で渡す

→ Test 画面・単語詳細画面ともに examples が空配列扱いになり表示されない。
meaning ごとに examples を表示する UI に組み替える必要あり。

---

## High — レスポンスが読めず実行時エラー

### 4. List エンドポイントの `{ data, pagination }` エンベロープ未対応

OpenAPI 全 list 系(wordbooks / words / meanings / examples)は次の形:

```json
{ "data": [...], "pagination": { current_page, total_pages, total_count, per_page } }
```

フロント実装は配列をそのまま受け取る前提:
- `src/lib/api/wordbooks.ts:8` — `listWordbooks(): Promise<Wordbook[]>`
- `src/lib/api/words.ts:11-15` — `listWords(): Promise<WordWithFirstMeaning[]>`
- `src/lib/api/meanings.ts:8-16` — `listMeanings(): Promise<Meaning[]>`
- `src/lib/api/examples.ts:8-16` — `listExamples(): Promise<Example[]>`

呼び出し側:
- `src/components/wordbook/wordbook-list.tsx:5` — `wordbooks.map(...)` でクラッシュ
- `src/components/word/word-list.tsx:12` — `allWords.filter(...)` でクラッシュ

→ 戻り値型を `{ data, pagination }` に変更 + `page` / `per_page` クエリパラメータをサポート。

---

### 5. `WordWithFirstMeaning.first_meaning` の shape

OpenAPI(`openapi.yaml:1002-1008`):

```yaml
first_meaning:
  type: object
  properties:
    definition: { type: string }
```

→ `definition` のみを持つ薄い object。

フロント `src/types/api.ts:48-50`:

```ts
export type WordWithFirstMeaning = Word & {
  first_meaning: Meaning | null;   # フル Meaning と仮定
};
```

→ `id` / `display_order` などにアクセスすると undefined。

---

### 6. `CreateWordInput.status` を送っているが OpenAPI POST では受け付けない

OpenAPI POST `/wordbooks/{id}/words`(`openapi.yaml:286-321`):

```yaml
required: [spelling]
properties: { spelling, meanings_attributes }
```

`status` の指定不可。

フロント:
- `src/types/api.ts:90-93` — `CreateWordInput { spelling, status }` を必須化
- `src/lib/actions/word-actions.ts:34-37` — `status: 'not_studied'` を送信

→ 422 にはならないかもしれないが、契約上は不要なので除去。

---

## Medium — 型定義の余剰 / 最適化漏れ

### 7. Word の作成で nested attributes を活用していない(N+1 リクエスト) ✅ 解消済み (#35)

OpenAPI POST `/words` は `meanings_attributes` + ネストした `examples_attributes` を 1 トランザクションで受け付ける。

`src/lib/actions/word-actions.ts:33-57` は word → meaning → example を逐次 3 リクエスト発行。

→ 1 リクエストにまとめると、原子性が担保され、ネットワーク往復も削減できる。
→ `createWordAction` で `meanings_attributes`(内側に `examples_attributes`)を組み立て、`createWord` 1 回で送信するよう変更。

---

### 8. ドメインモデルに OpenAPI 非公開のフィールドが残っている

| 型 | フロントの余剰フィールド | 出典 |
|---|---|---|
| `Wordbook` | `user_id`, `updated_at` | `src/types/api.ts:21-27` |
| `Word` | `wordbook_id`, `created_at`, `updated_at` | `src/types/api.ts:29-37` |
| `Meaning` | `word_id`, `created_at`, `updated_at` | `src/types/api.ts:39-46` |
| `Example` | `word_id`, `created_at`, `updated_at` | `src/types/api.ts:62-70` |
| `Setting` | `id`, `user_id`, `created_at`, `updated_at` | `src/types/api.ts:72-80` |
| `User` | `id`, `provider`, `provider_uid`, `created_at`, `updated_at` | `src/types/api.ts:9-19` |

→ 受信時は単に無視されるだけだが、参照しているコードがあると `undefined`。
`Example.word_id` は本来 `meaning_id` 相当だが、OpenAPI では公開していないので削除推奨。

---

### 9. Auth レスポンス型未定義

OpenAPI `/api/v1/auth/guest`, `/api/v1/auth/google` は次を返す:

```
{ user: { email?, name?, avatar_url?, guest_expires_at? }, token: string }
```

フロント側に対応する型が存在しない(`src/types/dto.ts` には `GuestUserDTO { name, token }` のみ)。
NextAuth 側で必要な値だけパースしているので即時バグにはならないが、型整備の余地あり。

---

### 10. Test エンドポイント `wordbook` レスポンスの型整合 ✅ 解消済み (#38)

OpenAPI(`openapi.yaml:1024-1030`)では `wordbook` は `{ id, title }` のみ。
フロント `TestWordsResponse.wordbook: Wordbook` は `user_id` / `created_at` / `updated_at` を含む型。
→ 上記 #8 と同根。`Pick<Wordbook, 'id' | 'title'>` 程度に絞るのが正しい。
→ `src/types/api.ts` の `TestWordsResponse.wordbook` を `Pick<Wordbook, 'id' | 'title'>` に変更して解消。

---

## 対応の優先順位(推奨)

1. **Critical 3 件** を 1 PR で対応(Examples パス・`definition` リネーム・examples ネスト対応)
2. **High 3 件** を 1 PR(`{ data, pagination }` エンベロープ・`first_meaning` shape・`status` 送信除去)
3. **Medium** は型クリーンアップとして個別 PR
   - 特に #7(nested attributes 活用)はすでに `feat/use-include-param` 系の最適化方針と整合的
