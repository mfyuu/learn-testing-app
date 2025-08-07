# TODOアプリケーション実装計画書

## 実装順序と手順

### Phase 1: 基礎セットアップ（依存関係とAPI型定義）

#### 1.1 必要なパッケージのインストール

```bash
pnpm add openapi-fetch swr
pnpm add -D openapi-typescript
```

#### 1.2 OpenAPI型定義の生成

- `package.json`にスクリプト追加
- `openapi/schema.yaml`から型定義を生成
- `lib/api/types.ts`に出力

#### 1.3 APIクライアントの設定

- `lib/api/client.ts`を作成
- openapi-fetchクライアントを設定
- ベースURLを設定

### Phase 2: shadcn/uiコンポーネントの追加

#### 2.1 必要なUIコンポーネントの追加

```bash
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add textarea
```

### Phase 3: カスタムフックの実装

#### 3.1 useTodosフック

- `lib/hooks/useTodos.ts`を作成
- SWRを使用してTODO一覧を取得
- ローディング、エラー状態の管理

#### 3.2 useTodoMutationsフック

- `lib/hooks/useTodoMutations.ts`を作成
- 作成、更新、削除、完了切り替えの関数を実装
- SWRのmutateを使用してキャッシュ更新

### Phase 4: TODOコンポーネントの実装

#### 4.1 TodoFormコンポーネント

- `components/todo/TodoForm.tsx`を作成
- タイトル、説明、期限の入力フィールド
- フォームバリデーション
- 作成処理の実装

#### 4.2 TodoItemコンポーネント

- `components/todo/TodoItem.tsx`を作成
- TODO情報の表示
- 完了状態の切り替え機能
- 編集・削除ボタンの配置

#### 4.3 TodoEditDialogコンポーネント

- `components/todo/TodoEditDialog.tsx`を作成
- ダイアログ内の編集フォーム
- 既存データの表示
- 更新処理の実装

#### 4.4 TodoListコンポーネント

- `components/todo/TodoList.tsx`を作成
- TODO一覧の表示
- ローディング・エラー状態の表示
- TodoItemの繰り返し表示

### Phase 5: メインページの実装

#### 5.1 page.tsxの更新

- `app/page.tsx`を更新
- "use client"ディレクティブを追加
- TodoFormとTodoListを配置
- 全体レイアウトの調整

### Phase 6: 最終調整とテスト

#### 6.1 スタイリングの調整

- Tailwind CSSクラスの適用
- レスポンシブ対応（基本的なもののみ）

#### 6.2 エラーハンドリングの確認

- API通信エラーの処理
- ユーザーフィードバックの実装

#### 6.3 動作確認

- CRUD操作の確認
- データの即座の反映確認
- エラー状態の確認

## 実装時の注意事項

### 技術的制約

- **必ず"use client"を使用**: Server Componentsは使用しない
- **テストは書かない**: 勉強会用に取っておく
- **型安全性を重視**: openapi-typescriptの型を活用

### コーディング規約

- Biomeの設定に従う（タブインデント、ダブルクォート）
- TypeScript strict modeを維持
- 型定義は明示的に行う（anyを避ける）

### パフォーマンス考慮

- SWRのキャッシュ戦略を適切に設定
- 不要なレンダリングを避ける
- 楽観的更新（Optimistic UI）の実装

## チェックリスト

### Phase 1

- [x] 必要なパッケージのインストール完了
- [x] OpenAPI型定義の生成完了
- [x] APIクライアントの設定完了

### Phase 2

- [ ] shadcn/uiコンポーネントの追加完了

### Phase 3

- [ ] useTodosフックの実装完了
- [ ] useTodoMutationsフックの実装完了

### Phase 4

- [ ] TodoFormコンポーネントの実装完了
- [ ] TodoItemコンポーネントの実装完了
- [ ] TodoEditDialogコンポーネントの実装完了
- [ ] TodoListコンポーネントの実装完了

### Phase 5

- [ ] page.tsxの更新完了

### Phase 6

- [ ] スタイリング調整完了
- [ ] エラーハンドリング確認完了
- [ ] 全機能の動作確認完了
- [ ] VS Code診断エラーがゼロ
- [ ] Biomeによるリント・フォーマットチェック完了
