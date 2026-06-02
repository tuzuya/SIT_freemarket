# アーキテクチャ概要

> **注意**: 現在 JSX → TSX への移行作業中のため、各コンポーネントに `.jsx` と `.tsx` の両ファイルが存在する場合があります。移行完了後は `.tsx` が正規ファイルとなります。

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript / JavaScript (JSX→TSX移行中) |
| バックエンド | Supabase (Auth + PostgreSQL + Storage) |
| アニメーション | GSAP |
| スタイル | CSS Modules |
| フォント | Geist, Noto Sans JP, Zen Maru Gothic |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.js              # ルートレイアウト（フォント・グローバルCSS設定）
│   ├── page.jsx               # ルートページ（サインイン or 購入ページへリダイレクト）
│   ├── globals.css            # グローバルスタイル
│   │
│   ├── signin/page.jsx        # ログインページ
│   ├── signup/page.jsx        # 会員登録ページ
│   ├── purchase/
│   │   ├── page.jsx           # 購入ページ（Suspenseラッパー）
│   │   └── PurchasePageClient.jsx  # 購入ページ本体（Client Component）
│   ├── sell/page.jsx          # 出品ページ
│   ├── merchandises/[id]/
│   │   └── page.jsx           # 商品詳細ページ（動的ルーティング）
│   │
│   ├── _validationFunctions/  # バリデーション関数群（_ = ルーティング対象外）
│   │   ├── validateEmail.ts
│   │   ├── validatePassword.ts
│   │   ├── validateConfirmPassword.ts
│   │   └── validateRequired.ts
│   │
│   ├── components/            # UIコンポーネント群
│   │   ├── Header/            # ヘッダー（ハンバーガーメニュー含む）
│   │   ├── HambargerBtn/      # ハンバーガーボタン
│   │   ├── HambargerMenu/     # ハンバーガーメニュー（旧版、現在未使用気味）
│   │   ├── HeaderMenu/        # ヘッダーナビゲーションメニュー
│   │   ├── HeaderMenuBtn/     # メニュー内の各ボタン
│   │   ├── CheckKeyWord/      # キーワード検索入力欄
│   │   ├── SelectCategory/    # アコーディオン式カテゴリ選択
│   │   ├── radioBtns/         # ラジオボタングループ
│   │   ├── SendBtn/           # 検索送信ボタン
│   │   ├── UserLog/           # パンくずリスト
│   │   ├── FormField/         # 汎用フォームフィールド
│   │   ├── SignInForm/        # ログインフォーム
│   │   ├── SignUpForm/        # 会員登録フォーム
│   │   ├── SellForm/          # 出品フォーム
│   │   ├── data/arrays.ts     # 検索用データ定義（学部・学科・学期・科目）
│   │   ├── preword.ts         # 文字列をそのまま返すユーティリティ
│   │   └── UserLogWords/      # パンくずリスト用データ生成
│   │
│   └── utils/supabase.ts      # Supabaseクライアント（レガシー、SellFormが使用中）
│
├── utils/supabase/
│   ├── client.ts              # ブラウザ用Supabaseクライアント生成
│   └── middleware.ts          # セッション更新処理（ミドルウェア用）
│
middleware.js                  # Next.jsミドルウェア（認証ガード）
```

---

## ページルーティングと認証フロー

```
ユーザーアクセス
      │
      ▼
middleware.js（全リクエストを監視）
      │
      ├─ / → 認証済み → /purchase
      │       未認証  → /signin
      │
      ├─ /purchase/* → 未認証 → /signin へ強制リダイレクト
      │
      └─ /signin → 認証済み → /purchase へリダイレクト
```

### 認証方式
- Supabase Auth（メール＋パスワード）
- セッション情報はCookieで管理
- `updateSession()` でCookieを毎リクエスト自動更新

---

## コンポーネント構成図

```
SignInPage / SignUpPage
└── Header
└── SignInForm / SignUpForm
    └── validateEmail / validatePassword / validateConfirmPassword / validateRequired

PurchasePage（Suspenseラッパー）
└── PurchasePageClient（"use client"）
    ├── Header
    │   ├── HambargerBtn
    │   └── HeaderMenu
    │       └── HeaderMenuBtn × 5
    ├── UserLog
    │   └── UserLogWords（パスからパンくず生成）
    ├── CheckKeyword（キーワード入力）
    ├── SelectCategory × 3（アコーディオン）
    │   └── RadioBtns（ラジオボタン群）
    └── SendBtn

MerchandiseDetail（"use client"）
└── Header

SellPage
└── Header
└── SellForm（"use client"）
```

---

## データフロー

### 購入フロー（検索）

```
1. ユーザーが検索フォームを入力・送信
2. handleSubmit → URLクエリパラメータを更新（router.push）
3. useEffect がsearchParamsの変化を検知
4. Supabaseの merchandises テーブルにクエリ
5. 結果が0件 → アラート
   結果が1件 → 自動的に商品詳細ページへ遷移（autoOpen=1フラグで制御）
   結果が複数 → 検索結果リストを表示
6. 商品クリック → /merchandises/[id]?returnTo=<元のURL> へ遷移
7. 戻るボタン → returnToパラメータのURLへ戻る
```

### 出品フロー

```
1. SellFormで商品情報を入力
2. handleSubmit → Supabase Auth でログイン確認
3. 画像をSupabase Storageの "images" バケットへアップロード
4. 公開URLを取得
5. merchandises テーブルへINSERT
```

### 認証フロー（サインイン）

```
1. SignInFormでメール・パスワードを入力
2. バリデーション（validateEmail, validatePassword, validateRequired）
3. supabase.auth.signInWithPassword() を呼び出し
4. 成功 → /purchase へ遷移
   失敗 → エラーメッセージを表示
```

---

## Supabase テーブル構成（コードから推測）

| テーブル名 | 主なカラム |
|-----------|-----------|
| `merchandises` | `id`, `name`, `price`, `image_url text[]`, `description`, `seller_id uuid`, `course_id`, `semester_id`, `subject_id`, `state_id`, `deliveryMethod_id`, `status text (available/pending/trading/sold)` ※ feature/purchase-flow, `buyer_id uuid` ※ feature/purchase-flow |
| `profiles` | `id uuid`（auth.usersのUUID）, `user_name text` |
| `favorites` | `user_id uuid references auth.users(id)`, `merchandise_id uuid references merchandises(id)` |
| `transactions` | `id`, `merchandise_id uuid`, `buyer_id uuid`, `seller_id uuid`, `delivery_method text (anonymous/leave)`, `status text (pending/trading/completed)`, `created_at timestamptz` ※ feature/purchase-flow ブランチで実装 |

### Supabase Storage バケット

| バケット名 | 用途 |
|-----------|------|
| `images` | 商品画像のアップロード先（SellForm.tsx） |

---

## Server Component / Client Component の分離方針

| ファイル | 種別 | 理由 |
|---------|------|------|
| `page.jsx` (ルート) | Server | リダイレクト処理のみ、状態不要 |
| `signin/page.jsx` | Server | レイアウトのみ |
| `signup/page.jsx` | Server | レイアウトのみ |
| `purchase/page.jsx` | Server | Suspenseラッパーのみ |
| `PurchasePageClient.jsx` | Client | useSearchParams, useState, useEffect使用 |
| `merchandises/[id]/page.jsx` | Client | useState, useEffect, useParams使用 |
| `sell/page.jsx` | Server | レイアウトのみ |
| `SellForm.tsx` | Client | useState, ファイル操作 |
| `Header.tsx` | Client | useState（メニュー開閉） |
| `SignInForm.jsx` | Client | useState, useRouter |
| `SignUpForm.jsx` | Client | useState, useRouter |

> `purchase/page.jsx` が `<Suspense>` でラップしているのは、`PurchasePageClient` が `useSearchParams` を使用しており、Next.jsのビルド時プリレンダーエラーを回避するため。
