# 意味の並び替え/削除が詳細・編集ページで反映されない問題の調査と修正

詳細ページで意味を並び替えたり、編集ページで意味を削除しても、画面遷移後の表示に反映されない問題があった。本ドキュメントでは原因と修正内容、および調査の過程で否定された仮説を残す。

---

## 症状

1. 詳細ページで意味をドラッグ&ドロップで並び替え → 編集ページへ遷移すると**古い順序**のまま表示される。ブラウザリロードで正しい順序になる。
2. 編集ページで意味を削除 → 詳細ページへ戻ると**削除した意味が残ったまま**表示される。ブラウザリロードで削除が反映されるが、同時に hydration error が発生する。

---

## 根本原因

### 主要因: Client Component の `useState` 初期値固定 + Router Cache によるインスタンス再利用

両症状の根本原因は同じ。

`WordForm` ([src/components/word/word-form.tsx](../src/components/word/word-form.tsx)) と `WordDetailMeanings` ([src/components/word/word-detail-meanings.tsx](../src/components/word/word-detail-meanings.tsx)) は、サーバから渡された `meanings` プロップを `useState` の初期値としてローカル State にコピーする実装になっている。

```tsx
// WordDetailMeanings
const [items, setItems] = useState<MeaningView[]>(meanings);

// WordForm
const [initial] = useState(() => buildInitialState(meanings));
const [rows, setRows] = useState<MeaningRow[]>(initial.rows);
```

React の `useState` 初期値は**初回マウント時にのみ評価**される。コンポーネントが再マウントされない限り、後から props が更新されてもローカル State は古い値のまま固定される。

Next.js App Router のクライアントサイド Router Cache はナビゲーション時に Client Component のインスタンスを保持・再利用するため、過去に同じページを訪問したことがある状態で再訪問すると、コンポーネントが**再マウントされず props 更新だけが行われる**。結果、ローカル State が古い値のまま画面に表示される。

ブラウザリロードでは React のメモリ全体が破棄されコンポーネントが新規マウントされるので、`useState` 初期値が新しい props で評価され直し、正しい表示になる。

### 副次要因: `toLocaleDateString` による hydration mismatch

詳細ページの「次の復習」日時表示で、サーバ(UTC)とブラウザ(JST)のタイムゾーン差によって SSR の HTML と CSR の描画結果が一致せず、React の hydration error が発生していた。これは Meaning の表示問題とは独立した問題。

`toLocaleDateString` に `timeZone` を渡さない場合、JavaScript ランタイムの環境変数(`TZ` 等)に依存して結果が変わる。本番環境ではサーバが UTC、ブラウザが JST であるため `hour: '2-digit'` 表示が 9 時間ズレる。

---

## 修正内容

### 1. `WordDetailMeanings` に `key` を渡して再マウントを強制

[src/components/word/word-detail.tsx](../src/components/word/word-detail.tsx)

```tsx
<WordDetailMeanings
  key={meanings.map((m) => m.id).join('-')}
  wordbookId={wordbookId}
  wordId={word.id}
  meanings={meanings}
/>
```

意味の集合・順序が変わると `key` 文字列が変化し、React がコンポーネントを破棄して再マウントする。これにより `useState(meanings)` の初期値が新しい順序で評価され、Router Cache に古いインスタンスが残っていてもバイパスできる。

### 2. `WordForm` にも同様に `key` を渡す

[src/app/(authenticated)/wordbooks/[wordbookId]/words/[wordId]/edit/page.tsx](../src/app/(authenticated)/wordbooks/[wordbookId]/words/[wordId]/edit/page.tsx)

```tsx
<WordForm
  key={sortedMeanings.map((m) => m.id).join('-')}
  wordbookId={Number(wordbookId)}
  word={word}
  meanings={sortedMeanings}
/>
```

### 3. 日付フォーマットに `timeZone` を明示

[src/components/word/word-detail.tsx](../src/components/word/word-detail.tsx)

```tsx
new Date(word.next_review_at).toLocaleDateString('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
})
```

サーバとブラウザの両方で `Asia/Tokyo` を使うことで、SSR と CSR の HTML が一致するようになり hydration error が解消する。

---

## 調査過程で否定された仮説

別の修正案も試したが効果がなかった。本問題に該当しない理由を以下に残す。

### A. `<Link prefetch={false}>` で編集リンクのプリフェッチを無効化

「プリフェッチされた古い RSC ペイロードがナビゲーション時に使われている」という仮説。試したが症状に変化なし。

理由: 本問題はサーバから返ってくる RSC ペイロード自体ではなく、**クライアント側の Client Component インスタンス**(`useState` の State)が古いまま再利用されていたため。サーバのペイロードが fresh でも、クライアントがそれを読み取らない構造だった。

### B. `next.config.ts` の `staleTimes.dynamic: 0` / `staleTimes.static` 調整

Router Cache の有効期限をゼロにする設定。`dynamic: 0` は既に設定済みだったが効果なし。

理由: `staleTimes` は「キャッシュされた RSC ペイロードをいつ stale 扱いにするか」の設定で、Client Component インスタンスの保持には影響しない。Router Cache の挙動として、ペイロードを fresh fetch してもコンポーネントツリーは reuse されることがある。

なお `staleTimes.static` には最小値 30 のバリデーションがあり、`0` を指定するとビルド時に警告が出るので注意。

### C. `export const dynamic = 'force-dynamic'`

ルートセグメント全体を動的化する案。本プロジェクトは `cacheComponents: true`(Next.js 16 の Cache Components モード)を有効化しているため、この指定は使えずビルドエラーになる。

```
Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`. Please remove it.
```

Cache Components モードではデフォルトで何もキャッシュされず、`'use cache'` ディレクティブで明示的に opt-in するモデル。Full Route Cache の話自体が前提として成立しないため、本問題には関係しない。

### D. `revalidatePath` で編集ルートも明示的に invalidate する

`reorderMeaningsAction` / `updateWordAction` 内で `revalidatePath` を呼ぶ実装は既に入っており、サーバ側のキャッシュは正しく無効化されていた。これも本問題の原因ではない。

---

## 学び

- Client Component のローカル State に props をコピーする場合、props の変化を反映する手段(`key` での強制再マウント、`useEffect` でのリセット、または props 由来の派生値として直接使う)を必ず用意する。
- Next.js App Router の Router Cache は **RSC ペイロード**と **Client Component インスタンス**の両方を保持する。`revalidatePath` や `staleTimes` はペイロード側にしか効かないため、State 由来の表示ズレは別途対処が必要。
- 日付フォーマットを SSR 環境で行う場合は `timeZone` を必ず明示する。ロケール(`ja-JP` 等)を指定しても TZ までは固定されない。
