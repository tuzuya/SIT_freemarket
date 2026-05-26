# セキュリティレビュー

最終更新: 2026-05-26

---

## 総評

フリマアプリとしての基本的な認証機構（Supabase Auth + ミドルウェア）は整っているが、
クライアントサイドでの入力検証・ルート保護・情報漏洩の点でいくつかの問題がある。

---

## 問題一覧

| # | 深刻度 | 場所 | 問題 |
|---|--------|------|------|
| 1 | **高** | `merchandises/[id]/page.tsx` | オープンリダイレクト（`returnTo`パラメータ） |
| 2 | **高** | `middleware.ts` | `/sell`・`/merchandises` が認証ガードの対象外 |
| 3 | **中** | `SellForm.tsx:183` | DB挿入エラーを無視して「出品完了」と表示する |
| 4 | **中** | `SellForm.tsx:171` | 価格のバリデーションなし（負の値・0・超大値） |
| 5 | **中** | `SellForm.tsx:149` | ファイル名に `Math.random()` を使用（衝突リスク） |
| 6 | **中** | `SellForm.tsx:268` | 画像MIMEタイプの検証がブラウザ側のみ |
| 7 | **低** | 複数ファイル | `console.log` にメールアドレス・パスワード・ユーザー情報を出力 |
| 8 | **低** | `next.config.mjs` | `ignoreBuildErrors: true` でセキュリティバグを見逃すリスク |

---

## 詳細と修正案

---

### 1. オープンリダイレクト（高）

**場所:** `src/app/merchandises/[id]/page.tsx:65`

**問題:**
`returnTo` をURLクエリパラメータからそのまま `router.push()` に渡している。
攻撃者が以下のようなURLをユーザーに踏ませると、「戻る」ボタン押下時に外部サイトへ飛ばせる。

```
/merchandises/1?returnTo=https://phishing-site.example.com
```

```tsx
// 現在のコード（危険）
const returnTo = searchParams.get("returnTo");
<button onClick={() => router.push(returnTo ?? "/")}>戻る</button>
```

**修正案:**
`returnTo` が自ドメイン内のパスであることを確認してから使用する。

```tsx
const rawReturnTo = searchParams.get("returnTo");

// 外部URLを弾く: "/"で始まるパスのみ許可
const returnTo = rawReturnTo && rawReturnTo.startsWith("/") ? rawReturnTo : "/purchase";

<button onClick={() => router.push(returnTo)}>戻る</button>
```

---

### 2. `/sell`・`/merchandises` が認証ガード対象外（高）

**場所:** `middleware.ts`

**問題:**
ミドルウェアが保護しているのは `/purchase` と `/signin` のみ。
`/sell`（出品フォーム）は未ログイン状態でもページを表示できる。
`/merchandises/[id]`（商品詳細）も同様。

`SellForm` 内で `supabase.auth.getUser()` を呼んでいるため、送信時はブロックされるが、
**フォーム自体の表示は防げておらず、UX上も不自然**（入力してから「ログインして」と言われる）。

```ts
// 現在のmatcher（/sellが含まれていない）
matcher: [
  '/',
  '/purchase/:path*',
  '/signin',
],
```

**修正案:**
`/sell` と `/merchandises/:path*` をミドルウェアの対象に追加し、
未認証ならリダイレクトするロジックを適用する。

```ts
// middleware.ts
export const config = {
  matcher: [
    '/',
    '/purchase/:path*',
    '/sell',
    '/merchandises/:path*',
    '/signin',
  ],
};
```

さらにミドルウェア本体で保護対象パスを定数にまとめる。

```ts
const PROTECTED_PATHS = ['/purchase', '/sell', '/merchandises'];

// isAuthenticated チェック部分
if (!isAuthenticated) {
  const isProtected = PROTECTED_PATHS.some(p =>
    request.nextUrl.pathname.startsWith(p)
  );
  if (isProtected) {
    const url = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(url);
  }
}
```

---

### 3. DB挿入エラーを無視して「出品完了」と表示（中）

**場所:** `src/app/components/SellForm/SellForm.tsx:183`

**問題:**
`insertError` を受け取っているが、その後に何もチェックしていない。
Supabaseへの書き込みが失敗しても「出品が完了しました！」というalertが表示される。

```ts
// 現在のコード（insertErrorを使っていない）
const { error: insertError } = await supabase
  .from("merchandises")
  .insert({ ... })

// ← insertErrorのチェックがないまま次に進む
alert("出品が完了しました！");
```

**修正案:**

```ts
const { error: insertError } = await supabase
  .from("merchandises")
  .insert({ ... })

// 追加: エラーチェック
if (insertError) throw insertError;

alert("出品が完了しました！");
```

---

### 4. 価格のバリデーションなし（中）

**場所:** `src/app/components/SellForm/SellForm.tsx:171`

**問題:**
価格は `type="number"` でフォームに入力されるが、負の値・0・極端に大きな値（例: 9999999999）のチェックがない。
HTMLの `required` のみでサーバー側（Supabase）へ何でも送れる。

```tsx
// 現在のコード
<input type="number" value={price} ... required />

// submit時
price: Number(price),  // 負の値・0・巨大な値がそのまま送られる
```

**修正案（submit前のバリデーション追加）:**

```ts
const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 追加: 価格バリデーション
    const priceNum = Number(price);
    if (!Number.isInteger(priceNum) || priceNum <= 0 || priceNum > 1_000_000) {
      throw new Error("価格は1円以上100万円以下の整数で入力してください");
    }

    // 以降は既存のコード...
    const { data: { user } } = await supabase.auth.getUser();
```

加えて、input にも `min` / `max` を設定しておく。

```tsx
<input
  type="number"
  min={1}
  max={1000000}
  step={1}
  value={price}
  ...
/>
```

---

### 5. ファイル名に `Math.random()` を使用（中）

**場所:** `src/app/components/SellForm/SellForm.tsx:149`

**問題:**
`Math.random()` は暗号学的に安全な乱数ではなく、理論上の予測・衝突リスクがある。
複数ユーザーが同時に画像をアップロードした際にファイル名が衝突する可能性がある。

```ts
// 現在のコード
const fileName = `${Math.random().toString(32).substring(2)}.${fileExt}`;
```

**修正案:**
標準APIの `crypto.randomUUID()` を使用する（Node.js・ブラウザ両方で利用可能）。

```ts
// ユーザーIDとタイムスタンプも組み合わせることでさらに安全
const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
```

ユーザーIDをパスに含めるとStorageのRLSポリシーで `auth.uid()` との照合もできるため推奨。

---

### 6. 画像MIMEタイプの検証がブラウザ側のみ（中）

**場所:** `src/app/components/SellForm/SellForm.tsx:268`

**問題:**
`accept="image/*"` はブラウザのファイル選択ダイアログのフィルタに過ぎず、
開発者ツールやcurlで直接リクエストすれば任意のファイル（スクリプト・実行ファイルなど）をアップロードできる。
Supabase Storageへのアップロード前にMIMEタイプをJavaScriptで確認する必要がある。

**修正案（`handleImageChange` にMIMEチェックを追加）:**

```ts
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  // 追加: MIMEタイプの検証
  const invalidFiles = files.filter(f => !ALLOWED_MIME_TYPES.includes(f.type));
  if (invalidFiles.length > 0) {
    alert("JPEG・PNG・WebP・GIF のみアップロードできます");
    e.target.value = "";
    return;
  }

  // 追加: ファイルサイズの上限チェック（例: 5MB）
  const MAX_SIZE_MB = 5;
  const oversizedFiles = files.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    alert(`1ファイルあたり${MAX_SIZE_MB}MB以下にしてください`);
    e.target.value = "";
    return;
  }

  // 以降は既存のコード...
```

---

### 7. `console.log` に機密情報を出力（低）

**問題箇所:**

| ファイル | 行 | 内容 |
|----------|-----|------|
| `SignInForm.tsx:74` | `console.log("ログイン失敗:", error.message)` | 認証エラー詳細 |
| `SignInForm.tsx:86` | `console.log("ログイン成功, purchaseページへ遷移:", data.user)` | **ユーザーオブジェクト全体**（メールアドレス含む） |
| `SignInForm.tsx:124` | `console.log("入力されたデータ:", values)` | **メールアドレス・パスワードを平文でログ出力** |
| `SignUpForm.tsx:149` | `console.log("入力されたデータ:", values)` | **メールアドレス・パスワード・ニックネームを平文でログ出力** |
| `SellForm.tsx:181` | `console.log("【送信データ確認】", insertData)` | 出品データ全体 |
| `merchandises/[id]/page.tsx:51` | `console.log(item)` | 商品の全カラム（seller_idなど） |

**影響:**
- 本番環境でブラウザの開発者ツールを開けば誰でも確認できる
- パスワードが平文でコンソールに残る（`SignInForm.tsx:124`・`SignUpForm.tsx:149`）

**修正案:**
開発中のデバッグログはすべて削除する。削除対象は上記の全行。

```tsx
// 削除するもの（例）
console.log("入力されたデータ:", values);  // パスワードが含まれる
console.log("ログイン成功, purchaseページへ遷移:", data.user);  // userオブジェクト全体
console.log(item);  // 商品の全カラム
```

---

### 8. ビルド時のTypeScript・ESLintエラーを無視（低）

**場所:** `next.config.mjs`

**問題:**
`typescript.ignoreBuildErrors: true` と `eslint.ignoreDuringBuilds: true` が設定されており、
型エラーや静的解析の警告があってもビルドが通ってしまう。
TypeScript化が完了したため、これらは本来不要なオプション。

```js
// next.config.mjs（現在）
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```

**修正案:**
TypeScript化が完了しており型エラーも0であることが確認できているため、両方を削除する。

```js
// next.config.mjs（修正後）
const nextConfig = {
  reactCompiler: true,
};
export default nextConfig;
```

---

## Supabase側で確認すべき設定（コードから確認不可）

以下はダッシュボードで確認・設定する項目。コードだけでは判断できないが重要。

| 項目 | 確認内容 |
|------|----------|
| **RLS（Row Level Security）** | `merchandises` / `profiles` テーブルで有効になっているか。有効でない場合、ユーザーが他人のデータを読み書きできる |
| **merchandisesテーブルのINSERT RLS** | `seller_id = auth.uid()` のポリシーがあるか。ないと、クライアントから偽のseller_idで出品できる |
| **Storageバケットのポリシー** | `images` バケットが Public になっている場合、認証なしで誰でもファイルをアップロードできる可能性がある。アップロードは認証済みのみに制限する |
| **メール確認（Email Confirmation）** | 会員登録時のメール確認が無効になっている場合、他人のメールアドレスで登録できる |

---

## 優先度まとめ

```
今すぐ修正すべき:
  1. オープンリダイレクト（returnTo検証）
  2. /sell・/merchandises の認証ガード追加
  3. insertError のチェック追加

次のPRで対応:
  4. 価格バリデーション
  5. ファイル名をcrypto.randomUUID()に変更
  6. MIMEタイプ検証の追加

リリース前に対応:
  7. console.logの削除
  8. ignoreBuildErrorsの削除
  9. Supabase ダッシュボードのRLS・Storage設定確認
```
