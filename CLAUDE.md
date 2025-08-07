# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# 開発サーバーの起動（Turbopackを使用）
pnpm dev

# ビルド
pnpm build

# リンティング
pnpm lint          # リントチェックのみ
pnpm lint:fix      # 自動修正付きリント
pnpm check         # Biomeによる完全チェック（フォーマット、リント、自動修正）

# フォーマット
pnpm format        # Biomeによるコードフォーマット
```

### Git Hooks

- **pre-commit**: Biome による自動チェックとフォーマット（staged files に対して実行）
- **pre-push**: push するファイルの Biome チェック

## アーキテクチャ概要

### 技術スタック

- **フレームワーク**: Next.js 15.4.6（App Router）
- **言語**: TypeScript（strict mode 有効）
- **スタイリング**: Tailwind CSS v4
- **コード品質**: Biome（リンター/フォーマッター）
- **パッケージマネージャー**: pnpm（必須）

### プロジェクト構造

- `app/`: App Router ディレクトリ（ページ、レイアウト、コンポーネント）
- `public/`: 静的ファイル（SVG アイコン等）
- TypeScript パスエイリアス: `@/*` → ルートディレクトリからの相対パス

### コード規約

- **インデント**: タブ使用（Biome 設定）
- **クォート**: ダブルクォート使用（JavaScript/TypeScript）
- **厳格な型チェック**: TypeScript strict mode 有効
- **インポート**: Biome による自動整理

## 開発ガイドライン

### ブランチ命名規則

機能ブランチは以下の形式に従ってください: `feat/issue/#<issue番号>`

### コミットメッセージ規約

Conventional Commits 形式に従ってください:

```
<type>(<scope>): <説明>
```

タイプ: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 重要な注意点

- pnpm 以外のパッケージマネージャーは使用不可（preinstall スクリプトで制限）
- コード変更後は必ず`pnpm lint`でエラーチェック
- VS Code 診断エラーがゼロになるまで作業を完了しない
