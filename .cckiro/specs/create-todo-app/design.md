# TODOアプリケーション設計書

## 1. アーキテクチャ設計

### 1.1 全体構成

```
┌─────────────────────────────────────────┐
│         Next.js App (Client)            │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │        Pages (Client)            │  │
│  │    app/page.tsx ("use client")   │  │
│  └──────────────────────────────────┘  │
│                  ↓                      │
│  ┌──────────────────────────────────┐  │
│  │         Components                │  │
│  │  - TodoList                      │  │
│  │  - TodoItem                      │  │
│  │  - TodoForm                      │  │
│  │  - TodoEditDialog                │  │
│  └──────────────────────────────────┘  │
│                  ↓                      │
│  ┌──────────────────────────────────┐  │
│  │       Custom Hooks                │  │
│  │  - useTodos (SWR)                │  │
│  │  - useTodoMutations              │  │
│  └──────────────────────────────────┘  │
│                  ↓                      │
│  ┌──────────────────────────────────┐  │
│  │       API Client                  │  │
│  │  openapi-fetch + 型定義           │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          External API                   │
│  https://learn-testing-api.namidapoo... │
└─────────────────────────────────────────┘
```

### 1.2 ディレクトリ構造

```
app/
├── page.tsx                    # メインページ（Client Component）
├── layout.tsx                  # ルートレイアウト
└── globals.css                 # グローバルスタイル

components/
├── ui/                         # shadcn/uiコンポーネント
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── textarea.tsx
└── todo/                       # TODOアプリケーション固有コンポーネント
    ├── TodoList.tsx
    ├── TodoItem.tsx
    ├── TodoForm.tsx
    └── TodoEditDialog.tsx

lib/
├── api/
│   ├── client.ts              # openapi-fetchクライアント設定
│   └── types.ts               # openapi-typescriptで生成した型
└── hooks/
    ├── useTodos.ts            # TODO一覧取得用フック
    └── useTodoMutations.ts    # TODO操作用フック

```

## 2. コンポーネント設計

### 2.1 page.tsx

- **責務**: アプリケーションのエントリーポイント
- **機能**:
  - TodoFormとTodoListを配置
  - 全体のレイアウト管理

### 2.2 TodoList

- **責務**: TODO一覧の表示
- **Props**: なし（内部でuseTodosフックを使用）
- **機能**:
  - TODO一覧の取得と表示
  - ローディング状態の表示
  - エラーハンドリング
  - 各TodoItemコンポーネントのレンダリング

### 2.3 TodoItem

- **責務**: 個別のTODOアイテムの表示と操作
- **Props**:
  - `todo: Todo` - TODOオブジェクト
  - `onUpdate: () => void` - 更新後のコールバック
- **機能**:
  - TODO情報の表示（タイトル、説明、期限、完了状態）
  - 完了状態の切り替え（チェックボックス）
  - 編集ダイアログの表示
  - 削除機能

### 2.4 TodoForm

- **責務**: 新規TODO作成フォーム
- **Props**:
  - `onSuccess: () => void` - 作成成功後のコールバック
- **機能**:
  - タイトル入力（必須）
  - 説明入力（任意）
  - 期限入力（任意）
  - バリデーション
  - 作成処理

### 2.5 TodoEditDialog

- **責務**: TODO編集用ダイアログ
- **Props**:
  - `todo: Todo` - 編集対象のTODO
  - `open: boolean` - ダイアログの開閉状態
  - `onOpenChange: (open: boolean) => void` - 開閉状態の変更
  - `onSuccess: () => void` - 更新成功後のコールバック
- **機能**:
  - 既存データの表示
  - 各フィールドの編集
  - 更新処理

## 3. データフロー設計

### 3.1 データ取得（SWR）

```typescript
// useTodos.ts
const { data, error, isLoading, mutate } = useSWR("/api/todos", fetcher, {
  revalidateOnFocus: true,
  revalidateOnMount: true,
});
```

### 3.2 データ更新フロー

1. **作成**: TodoForm → useTodoMutations.create → API → SWR mutate
2. **更新**: TodoEditDialog → useTodoMutations.update → API → SWR mutate
3. **削除**: TodoItem → useTodoMutations.delete → API → SWR mutate
4. **完了切り替え**: TodoItem → useTodoMutations.toggle → API → SWR mutate

## 4. API通信設計

### 4.1 openapi-fetchクライアント

```typescript
// lib/api/client.ts
import createClient from "openapi-fetch";
import type { paths } from "./types";

export const apiClient = createClient<paths>({
  baseUrl: "https://learn-testing-api.namidapoo.workers.dev",
});
```

### 4.2 型定義

- `openapi-typescript`で`schema.yaml`から自動生成
- `paths`型を使用してタイプセーフなAPI呼び出し

## 5. UI/UX設計

### 5.1 レイアウト

```
┌──────────────────────────────────────┐
│            TODOアプリ                │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │     新規TODO作成フォーム       │  │
│  │  [タイトル入力]                │  │
│  │  [説明入力]                    │  │
│  │  [期限選択]     [作成ボタン]   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │         TODO一覧               │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │ ☐ タスク1                │  │  │
│  │  │   説明文...               │  │  │
│  │  │   期限: 2024/12/31        │  │  │
│  │  │   [編集] [削除]          │  │  │
│  │  └──────────────────────────┘  │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │ ☑ タスク2（完了）        │  │  │
│  │  │   説明文...               │  │  │
│  │  │   [編集] [削除]          │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 5.2 使用するshadcn/uiコンポーネント

- **Button**: 各種アクション用
- **Card**: TODOアイテムの表示用
- **Checkbox**: 完了状態の切り替え用
- **Dialog**: 編集フォーム用
- **Input**: テキスト入力用
- **Label**: フォームラベル用
- **Textarea**: 説明入力用

## 6. エラーハンドリング設計

### 6.1 API通信エラー

- ネットワークエラー: トースト通知で表示
- バリデーションエラー: フォーム内にインラインで表示
- 404エラー: 該当のTODOが見つからない旨を表示

### 6.2 フォームバリデーション

- クライアント側: 必須項目のチェック
- サーバー側: APIレスポンスのエラーを表示

## 7. 状態管理設計

### 7.1 グローバル状態

- SWRによるキャッシュ管理のみ
- 追加の状態管理ライブラリは使用しない

### 7.2 ローカル状態

- フォーム入力値: React Hook Form または useState
- ダイアログ開閉: useState
- ローディング状態: SWRのisLoading
