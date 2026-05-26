# 開発進行状況

最終更新: 2026-05-26

---

## 完了済み

### インフラ・設定
- [x] Next.js プロジェクトのセットアップ
- [x] Supabase 連携（`@supabase/ssr` によるSSR対応）
- [x] TypeScript 化（`.jsx`/`.js` → `.tsx`/`.ts`）
- [x] ミドルウェアによるルート保護（未認証なら `/purchase` → `/signin` にリダイレクト）
- [x] `tsconfig.json` の設定

### 認証
- [x] 会員登録ページ（`/signup`）
  - メールアドレス・パスワード・ニックネームの入力
  - バリデーション（大学メールアドレス形式・8文字以上パスワード・必須チェック）
  - Supabase Auth への登録 + `profiles` テーブルへのプロフィール挿入
- [x] ログインページ（`/signin`）
  - バリデーション
  - Supabase Auth によるセッション取得
  - 連打防止（`isLoading` ステート）

### 購入（商品検索）
- [x] 商品検索ページ（`/purchase`）
  - キーワード検索
  - 学部・学科 / 学年・学期 / 科目 によるアコーディオン絞り込み
  - URLクエリパラメータへの検索条件の保存（ページ遷移後の状態復元）
  - 検索結果一覧表示
  - 検索結果が1件のときは直接商品詳細へ遷移（`autoOpen` フラグで無限ループを防止）
- [x] 商品詳細ページ（`/merchandises/[id]`）
  - 商品名・価格・状態・説明・画像の表示
  - 「戻る」ボタン（`returnTo` クエリで元のページに戻る）

### 出品
- [x] 出品フォーム（`/sell`）
  - 複数画像のアップロード（最大5枚、Supabase Storage）
  - 商品名・価格・科目・状態・コース・学期・受け渡し方法・説明の入力
  - Supabase `merchandises` テーブルへのデータ挿入

### UIコンポーネント
- [x] ヘッダー（時刻・信号アイコン・ページタイトル・ハンバーガーボタン）
- [x] ハンバーガーメニュー（購入/出品/ログイン会員登録への遷移）
- [x] アコーディオンカテゴリ（GSAP アニメーション付き）
- [x] ラジオボタン群
- [x] バリデーション関数群（email / password / confirmPassword / required）

---

## バグ・未対処の問題

| 場所 | 内容 |
|------|------|
| `SellForm.tsx:183` | `insertError` を受け取っているが使っていない。出品INSERT失敗時にalertが出ない |
| `CheckKeyword.tsx` | `PurchasePageClient` から `value`/`onChange` が渡されているが、コンポーネント内で無視されている。検索条件の状態復元に影響する可能性あり |
| `UserLogWords.ts` | パスマッピングが `/home`・`/home/search` のままで、実際のルート（`/purchase`等）と一致していない。パンくずリストが常に空になる |
| `page.tsx`（ルート） | `isLoggedIn = false` がハードコードされている。ミドルウェアが代わりに動作しているため現状は問題ないが、本来はSupabaseで認証状態を確認すべき |
| `PurchasePageClient.tsx:116` | 検索ヒットが1件のとき、`autoOpen`フラグで一応対処しているが、TODO コメントあり。動作確認が必要 |

---

## 未実装機能

### 認証・アカウント
- [ ] **ログアウト機能**（`supabase.auth.signOut()`）。ヘッダーメニューにボタンがない
- [ ] **マイページ**（`/mypage` ページ自体が存在しない）
  - 出品履歴
  - 購入履歴
  - プロフィール編集

### 購入フロー
- [ ] **購入確定フロー**
  - 商品詳細ページに「購入する」ボタンがない
  - 購入意思の確認・取引相手への通知の仕組みがない
  - Supabase の `purchases` 等のテーブルへの書き込みが未実装

### いいね
- [ ] **いいね機能**（ヘッダーメニューにボタンはあるが `/like` ページが存在しない）
  - いいね一覧ページ
  - 商品詳細でのいいね追加・削除

### 出品
- [ ] 出品した商品の編集・削除機能
- [ ] 出品完了後のマイページへのリダイレクト（現状は `alert` で完了を通知するだけ）

### 検索・表示
- [ ] 商品詳細ページの「購入する」ボタン
- [ ] 商品一覧（全件表示）。現状は検索結果のみ表示
- [ ] 画像が複数枚あるときのスライダー表示（詳細ページで `image_url[0]` のみ表示中）

### UI・デザイン
- [ ] `FormField` コンポーネントへの CSS 適用（TODO コメントあり）
- [ ] `SelectCategory` の押している項目のみ `box-shadow` を適用（コメントに「未実装」と記載）
- [ ] パンくずリスト（`UserLogWords`）の現在のルートへの対応

---

## ディレクトリ構成（現状）

```
src/
├── app/
│   ├── _validationFunctions/   # バリデーション関数
│   ├── components/             # UIコンポーネント
│   │   ├── CheckKeyWord/
│   │   ├── FormField/
│   │   ├── HambargerBtn/
│   │   ├── HambargerMenu/
│   │   ├── Header/
│   │   ├── HeaderMenu/
│   │   ├── HeaderMenuBtn/
│   │   ├── SelectCategory/
│   │   ├── SellForm/
│   │   ├── SendBtn/
│   │   ├── SignInForm/
│   │   ├── SignUpForm/
│   │   ├── UserLog/
│   │   ├── UserLogWords/
│   │   ├── data/               # 学部・科目等の静的データ
│   │   ├── preword.ts
│   │   └── radioBtns/
│   ├── merchandises/[id]/      # 商品詳細ページ
│   ├── purchase/               # 商品検索ページ
│   ├── sell/                   # 出品ページ
│   ├── signin/                 # ログインページ
│   ├── signup/                 # 会員登録ページ
│   └── utils/                  # supabase クライアント（app内用）
├── types/
│   └── css-modules.d.ts        # CSSモジュールの型宣言
└── utils/
    └── supabase/
        ├── client.ts           # ブラウザ用 Supabase クライアント
        └── middleware.ts       # セッション更新処理
middleware.ts                   # ルート保護ミドルウェア
```
