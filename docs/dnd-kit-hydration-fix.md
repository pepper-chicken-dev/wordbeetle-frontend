# 意味リストの hydration mismatch (dnd-kit) の調査と修正

単語詳細ページの意味リストで、特定の操作後に hydration mismatch エラーが発生していた。本ドキュメントでは原因と最終的な修正、および調査の過程で立てた**誤った仮説**を学習目的で残す。

---

## 症状

1. **シナリオ A**: 編集ページで「2 件ある意味のうち 1 件目」を削除 → 詳細ページに戻る → hydration error が発生する
2. **シナリオ B**: 上記操作後、詳細ページでブラウザリロード → hydration error が発生する

エラーの該当箇所はドラッグハンドルの `<button>` 要素で、ブラウザ DevTools の差分は以下:

```
- aria-describedby="DndDescribedBy-5"   // client
+ aria-describedby="DndDescribedBy-0"   // server
```

---

## 根本原因: dnd-kit の `useUniqueId` が SSR セーフでない

`@dnd-kit/core` の内部ヘルパー `useUniqueId` は、React の `useId` ではなく **モジュールスコープのカウンタ** で ID を発番する。

```ts
// dnd-kit 内部 (擬似コード)
let count = 0;
function getId() { return ++count; }
export function useUniqueId(prefix: string) {
  return useMemo(() => `${prefix}-${getId()}`, []);
}
```

このカウンタはサーバとクライアントで独立しており、以下の要因で値がズレる:

- **サーバ側**: Next.js dev サーバの Node プロセスはリクエストを跨いでモジュールを保持するため、ナビゲーションごとにカウンタが進んでいく。新しい SSR ではカウンタが特定の値から始まる
- **クライアント側**: ブラウザのリロードでは毎回カウンタが 0 から始まるが、`DndContext` の内部実装が `useUniqueId` を複数回呼ぶため、対象の `useSortable` に到達する頃には数 increment 進んでいる
- **React Strict Mode**: 開発モードでコンポーネントを 2 回レンダリングするため、クライアント側のカウンタが余分に進む

結果として、SSR の HTML に書かれた `aria-describedby="DndDescribedBy-0"` と、クライアントハイドレーション時に生成される `aria-describedby="DndDescribedBy-5"` が一致せず、React の hydration check に引っかかる。これは dnd-kit の[既知の SSR 問題](https://github.com/clauderic/dnd-kit/issues/926)。

---

## 修正内容

[src/components/word/word-detail-meanings.tsx](../src/components/word/word-detail-meanings.tsx)

### 1. `useSyncExternalStore` でクライアントマウントを検出

```tsx
const emptySubscribe = () => () => {};
const useIsMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,   // client snapshot
    () => false   // server snapshot
  );
```

- SSR: `getServerSnapshot` → `false`
- ハイドレーション初回レンダリング: `getServerSnapshot` → `false` (サーバと一致)
- ハイドレーション完了後: `getSnapshot` → `true` に切り替わり再レンダリング

`useEffect` + `setState` でも同等のことはできるが、プロジェクトの ESLint ルール `react-hooks/set-state-in-effect` に抵触するため `useSyncExternalStore` を採用した。

### 2. `DndContext` 配下を `isMounted` でゲート

```tsx
{isMounted ? (
  <DndContext ...>
    <SortableContext ...>
      <ul>
        {visibleItems.map((meaning, index) => (
          <SortableMeaningItem key={meaning.id} ... />
        ))}
      </ul>
    </SortableContext>
  </DndContext>
) : (
  <ul>
    {visibleItems.map((meaning, index) => (
      <StaticMeaningItem key={meaning.id} ... />
    ))}
  </ul>
)}
```

- SSR とハイドレーション中: `StaticMeaningItem` (dnd-kit attributes なし) をレンダリング
- ハイドレーション完了後: `SortableMeaningItem` に差し替え

### 3. `StaticMeaningItem` と `MeaningBody` の追加

`SortableMeaningItem` と同じ見た目を SSR でも出力するため、`useSortable` を呼ばない静的版 `StaticMeaningItem` を用意。内側のコンテンツ (definition / examples) は `MeaningBody` として切り出して両者で共有。

---

## 学習: 不要だった「最初の修正試行」

最終的な修正の前に **`useState(meanings)` → `useOptimistic(meanings)` への切り替え** を別コミットで入れていたが、検証の結果これは hydration エラーの解決には**不要だった**ため、PR から取り下げた。

### 当時立てていた仮説

エラーが「2 件中 1 件目を削除した時だけ」起きるという報告から、以下のように推論した:

- 削除前: 残る意味は `index=1` → `meaningCardClass(1)` = pink、`aria-label="意味 2"`
- 削除後: 残る意味は `index=0` → `meaningCardClass(0)` = blue、`aria-label="意味 1"`
- `useState(meanings)` でローカル State にコピーしているため、props が更新されてもローカル State は古い `index` を保持し続け、サーバ (新 index) とクライアント (旧 index) で `className` / `aria-label` が一致しない

→ `useOptimistic` に置き換えれば props が単一の真実源になるので mismatch が消える、と判断した。

### なぜ仮説が外れていたか

1. **親が `key` で remount している**: [word-detail.tsx](../src/components/word/word-detail.tsx) で `key={meanings.map((m) => m.id).join('-')}` を渡しているため、意味集合が変わると `WordDetailMeanings` はそもそも再マウントされ、`useState` の初期値が新 props で評価され直す。**ローカル State が古いまま残ることはなかった。**
2. **実際の mismatch 箇所が違った**: 差分を確認すると `className` でも `aria-label` でもなく `aria-describedby` (dnd-kit が発番) が原因だった。これは index には依存していない。
3. **リロード時にも再現した**: もしローカル State の stale が原因なら、クライアント側の React 状態が完全に消えるリロード時には mismatch は起きないはず。リロードで再現したことが「stale state 仮説では説明できない」決定的なシグナルだった。

### 教訓

- **症状の表面的なパターン (「1 件目削除時だけ」) から原因を逆算するときは複数の仮説を並べる**。本件は「index に依存する出力 (className/aria-label) のどれかが mismatch している」というのが最初に思いつく仮説だったが、実際はそれら全てが偽で、別の index 非依存な出力 (aria-describedby) が原因だった
- **hydration mismatch のエラーメッセージに含まれる Server/Client 両方の HTML 差分を**最初に**確認する**。本件では `aria-describedby` の値の違いが当初から DevTools に出ていたのに、仮説に沿った検証 (className 仮説) を先行させてしまい遠回りした
- **修正によってエラーが消えたように見えても、それが本当に原因を解消したからか、別要因で偶然マスクされただけかを区別する必要がある**。`useOptimistic` 化と並行して入れた `key` 周りの整理が偶然 dnd-kit 問題の発火条件もずらしていた可能性があり、playwright での「リロード時の再現確認」を最初に通していれば早期に気づけた

---

## 関連

- 同じ画面で過去に発生した別の hydration / stale display 問題: [meaning-stale-display-fix.md](./meaning-stale-display-fix.md)
- PR: <https://github.com/pepper-chicken-dev/wordbeetle-frontend/pull/107>
