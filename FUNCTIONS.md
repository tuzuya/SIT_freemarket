# 関数・コンポーネント リファレンス

> **注意**: JSX → TSX 移行作業中のため、一部コンポーネントは `.jsx` と `.tsx` の両ファイルが存在します。TSXファイルが存在する場合はそちらが正規版です。

---

## バリデーション関数（`src/app/_validationFunctions/`）

### `validateEmail(email: string): string | null`

**ファイル**: `validateEmail.ts`

メールアドレスが芝浦工業大学のドメイン（`@shibaura-it.ac.jp`）かどうかを検証する。

| 引数 | 型 | 説明 |
|------|----|------|
| `email` | `string` | 検証するメールアドレス |

| 戻り値 | 条件 |
|--------|------|
| `null` | 正規表現 `/^.+@shibaura-it\.ac\.jp$/` に一致する場合（有効） |
| `string` | 一致しない場合、エラーメッセージを返す |

```ts
// 使用例
const error = validateEmail("AB12345@shibaura-it.ac.jp"); // → null
const error2 = validateEmail("test@gmail.com"); // → "大学のメールアドレスを入力して下さい"
```

---

### `validatePassword(password: string): string | null`

**ファイル**: `validatePassword.ts`

パスワードが8文字以上かどうかを検証する。

| 引数 | 型 | 説明 |
|------|----|------|
| `password` | `string` | 検証するパスワード |

| 戻り値 | 条件 |
|--------|------|
| `null` | 8文字以上の場合（有効） |
| `string` | 8文字未満の場合、エラーメッセージを返す |

---

### `validateConfirmPassword(password: string, confirmPassword: string): string | null`

**ファイル**: `validateConfirmPassword.ts`

パスワードと確認用パスワードが一致するかを検証する。

| 引数 | 型 | 説明 |
|------|----|------|
| `password` | `string` | 元のパスワード |
| `confirmPassword` | `string` | 確認用パスワード |

| 戻り値 | 条件 |
|--------|------|
| `null` | 2つのパスワードが一致する場合（有効） |
| `string` | 一致しない場合、エラーメッセージを返す |

---

### `validateRequired(value: string): string | null`

**ファイル**: `validateRequired.ts`

入力値が空（または空白のみ）でないかを検証する。`trim()` でホワイトスペースを除去して判定する。

| 引数 | 型 | 説明 |
|------|----|------|
| `value` | `string` | 検証する入力値 |

| 戻り値 | 条件 |
|--------|------|
| `null` | 空でない場合（有効） |
| `string` | 空または空白のみの場合、エラーメッセージを返す |

---

## Supabaseクライアント（`src/utils/supabase/`）

### `createClient(): SupabaseClient`

**ファイル**: `src/utils/supabase/client.ts`

ブラウザ（Client Component）用のSupabaseクライアントを生成して返す。`@supabase/ssr` の `createBrowserClient` を使用する。環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が必要。

```ts
// Client Component内での使用例
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
const { data, error } = await supabase.from("merchandises").select("*");
```

---

### `updateSession(request: NextRequest): Promise<{ supabaseResponse, user }>`

**ファイル**: `src/utils/supabase/middleware.ts`

ミドルウェア専用。リクエストに含まれるCookieからSupabaseセッションを読み込み、必要に応じてCookieを更新する。`getUser()` ではなくこちらを使う理由は、セッションCookieの自動更新も行うため。

| 戻り値 | 説明 |
|--------|------|
| `supabaseResponse` | 更新済みCookieを含むNextResponse。ミドルウェアの最後に必ずこれを返す |
| `user` | 認証済みユーザー情報。未認証の場合は `null` |

---

## UIコンポーネント

### `Header({ pageTitle, imgSrc? })`

**ファイル**: `src/app/components/Header/Header.tsx`

全ページ共通のヘッダー。ステータスバー（時刻・電波・バッテリー）、ページタイトル、ハンバーガーメニューボタンを表示する。

| Props | 型 | 必須 | 説明 |
|-------|----|------|------|
| `pageTitle` | `string` | ○ | ヘッダーに表示するページタイトル |
| `imgSrc` | `string` | - | タイトル横に表示するアイコン画像のパス |

内部で `open` stateを持ち、`HambargerBtn` のクリックで `HeaderMenu` の表示/非表示を制御する。

```tsx
// 使用例
<Header pageTitle="購入する" imgSrc="/cart.png" />
```

---

### `HambargerBtn({ onClick, open })`

**ファイル**: `src/app/components/HambargerBtn/HambargerBtn.tsx`

ハンバーガーアイコンのボタン。`open` が `true` のとき `active` クラスを付与し、アニメーションでバツ印に変化する。

| Props | 型 | 説明 |
|-------|----|------|
| `onClick` | `() => void` | クリック時のコールバック |
| `open` | `boolean` | メニュー開閉状態 |

---

### `HeaderMenu({ open })`

**ファイル**: `src/app/components/HeaderMenu/HeaderMenu.tsx`

ハンバーガーメニューの中身。`open` が `true` のとき `active` クラスで表示される。内部に `HeaderMenuBtn` を5つ持ち、各ボタンに `router.push()` でナビゲーションを設定している。

| Props | 型 | 説明 |
|-------|----|------|
| `open` | `boolean` | メニュー開閉状態 |

---

### `HeaderMenuBtn({ iconSource, word, onClick? })`

**ファイル**: `src/app/components/HeaderMenuBtn/HeaderMenuBtn.tsx`

メニュー内の各ナビゲーションボタン。アイコン画像とテキストを縦並びで表示する。

| Props | 型 | 必須 | 説明 |
|-------|----|------|------|
| `iconSource` | `string` | ○ | アイコン画像のパス |
| `word` | `string` | ○ | ボタンのテキスト |
| `onClick` | `() => void` | - | クリック時のコールバック（未指定でも動作する） |

---

### `CheckKeyword({ value?, onChange? })`

**ファイル**: `src/app/components/CheckKeyWord/CheckKeyword.tsx`

キーワード検索の入力欄。`name="key-word"` を持つため、親フォームの `FormData.get("key-word")` で値を取得できる。

> 現在の実装では `value` と `onChange` を受け取るPropsが定義されていないが、`PurchasePageClient` から `searchConditions.keyword` を渡す設計を想定している。

---

### `SelectCategory({ categoryWord, imgSorce?, children? })`

**ファイル**: `src/app/components/SelectCategory/SelectCategory.tsx`

アコーディオン式のカテゴリ選択UI。内部で `isOpen` stateを持ち、GSAPアニメーションで子要素を展開/折りたたみする。子要素として別の `SelectCategory` や `RadioBtns` をネストできる。

| Props | 型 | 必須 | 説明 |
|-------|----|------|------|
| `categoryWord` | `string` | ○ | カテゴリ名（ボタンに表示） |
| `imgSorce` | `string` | - | カテゴリアイコン画像のパス |
| `children` | `ReactNode` | - | 展開時に表示するコンテンツ |

内部関数:
- `openingAnim(content)`: GSAPで高さ・透明度をアニメーションして展開
- `closingAnim(content)`: GSAPで高さ・透明度をアニメーションして折りたたみ

---

### `RadioBtns({ items, name, selectedValue?, onChange? })`

**ファイル**: `src/app/components/radioBtns/radioBtns.tsx`

`RadioItem[]` 配列を受け取り、ラジオボタンのリストを生成する。制御コンポーネントとして動作する（`selectedValue` と `onChange` で親が状態を管理）。

| Props | 型 | 必須 | 説明 |
|-------|----|------|------|
| `items` | `RadioItem[]` | ○ | ラジオボタンの選択肢リスト |
| `name` | `string` | ○ | ラジオボタングループ名（HTMLのname属性） |
| `selectedValue` | `string` | - | 現在選択中の値（`forSearch` の値） |
| `onChange` | `(value: string) => void` | - | 選択変更時のコールバック |

---

### `SendBtn()`

**ファイル**: `src/app/components/SendBtn/SendBtn.tsx`

`type="submit"` の検索ボタン。引数なし。親の `<form>` に紐付いて動作する。

---

### `UserLog()`

**ファイル**: `src/app/components/UserLog/UserLog.tsx`

現在のパスから `UserLogWords()` を呼び出し、パンくずリストを表示する。`usePathname()` で現在のパスを取得する。

---

### `FormField({ inputTitle, inputType, inputValue, inputFunction, instructionalText?, isRequired? })`

**ファイル**: `src/app/components/FormField/FormField.tsx`

汎用フォームフィールドコンポーネント。ラベル・入力欄・補足テキスト・必須バッジをセットにして返す。`useId()` で一意なIDを生成し、labelとinputを紐付ける。

| Props | 型 | 必須 | 説明 |
|-------|----|------|------|
| `inputTitle` | `string` | ○ | ラベルテキスト（placeholder兼用） |
| `inputType` | `string` | ○ | inputのtype属性 |
| `inputValue` | `string` | ○ | 現在の入力値 |
| `inputFunction` | `(value: string) => void` | ○ | 入力変更時のコールバック |
| `instructionalText` | `string` | - | 補足説明テキスト（※〜 と表示） |
| `isRequired` | `boolean` | - | 必須バッジと `required` 属性を付与（デフォルト: false） |

---

### `SignInForm()`

**ファイル**: `src/app/components/SignInForm/SignInForm.jsx`

ログインフォーム。メール・パスワードの入力、バリデーション、Supabase Auth認証を担当する。

主要な内部関数:

#### `supabaseAuthentication(email, password)`
`supabase.auth.signInWithPassword()` を呼び出す。成功時は `/purchase` へ遷移、失敗時は `authError` stateにメッセージをセットする。二重送信防止のため `isLoading` stateを使用する。

#### `handleSubmit(e)`
フォーム送信時の処理。
1. `validateRequired` で空チェック
2. `validateEmail`, `validatePassword` でフォーマットチェック
3. バリデーション通過後に `supabaseAuthentication()` を呼び出す

#### `handleChange(fieldName, newValue)`
入力値の更新と、入力フィールドのエラー表示クリアを同時に行う。

---

### `SignUpForm()`

**ファイル**: `src/app/components/SignUpForm/SignUpForm.jsx`

会員登録フォーム。ニックネーム・メール・パスワード・確認用パスワードの入力と登録処理を担当する。

主要な内部関数:

#### `supabaseRegistration(email, password, nickname)`
1. `supabase.auth.signUp()` でAuthに登録（`user_name` をメタデータとして付与）
2. 成功後、`profiles` テーブルに `id` と `user_name` をINSERT
3. 成功: `true` を返す / 失敗: `false` を返す

#### `handleSubmit(e)`
バリデーション後に `supabaseRegistration()` を呼び出す。登録成功時は `/purchase` へ遷移。

---

### `SellForm()`

**ファイル**: `src/app/components/SellForm/SellForm.tsx`

出品フォーム。画像アップロード、商品情報の入力、Supabaseへの登録を担当する。

主要な内部定数（文字列→ID変換マップ）:
- `SUBJECT_MAP`: 科目名 → subject_id
- `STATE_MAP`: 状態名 → state_id
- `DELIVERYMETHOD_MAP`: 受渡方法名 → deliveryMethod_id
- `COURSE_MAP`: コース名 → course_id
- `SEMESTER_MAP`: 学期名 → semester_id

主要な内部関数:

#### `handleImageChange(e)`
ファイル選択時の処理。最大5枚の制限チェック後、`URL.createObjectURL()` でプレビューURLを生成して `images` stateに追加する。

#### `removeImage(indexToRemove)`
指定インデックスの画像を `images` stateから削除する。

#### `handleSubmit(e)`
1. ログイン確認・画像有無チェック
2. 各種IDへの変換（`*_MAP` を使用）
3. `Promise.all()` で全画像を並列アップロード
4. `merchandises` テーブルへINSERT
5. 成功後に全stateを初期値にリセット

---

## データ定義（`src/app/components/data/arrays.ts`）

### `options: CategoryOption[]`

購入ページの検索カテゴリ定義。3つのグループ（学部・学科 / 学年・学期 / 科目）を階層構造で保持する。各末端の `RadioItem` は `forSearch` フィールドにDB検索用IDを持つ。

### `getName: NameItem[]`

`course_id`（1〜23）をコース名に変換するためのマスターデータ。

### `getPeriod: NameItem[]`

`semester_id`（1〜8）を「1年春」などの表示名に変換するためのマスターデータ。

### `getSubject: NameItem[]`

`subject_id`（1〜7）を科目名に変換するためのマスターデータ。

---

## ユーティリティ

### `UserLogWords(userLog: string): LogEntry[]`

**ファイル**: `src/app/components/UserLogWords/UserLogWords.ts`

現在のパス文字列を受け取り、パンくずリスト用の `LogEntry[]` を返す。`UserLog` コンポーネントから呼び出される。

| 引数 | 型 | 説明 |
|------|----|------|
| `userLog` | `string` | `usePathname()` で取得した現在のパス |

| `LogEntry` フィールド | 説明 |
|--------------------|------|
| `label` | 表示テキスト |
| `img` | アイコン画像パス（省略可） |
| `state` | `"Current"` の場合、CSSで現在地スタイルを適用 |

---

### `preWord(receivedWord: string): string`

**ファイル**: `src/app/components/preword.ts`

受け取った文字列をそのまま返す。将来的な文字列前処理の拡張用プレースホルダー。

---

## ページレベルの主要ロジック（`PurchasePageClient`）

### `handleSubmit(e)`

検索フォームの送信処理。`FormData` から検索条件を取得し、`router.push()` でURLクエリを更新する。実際のDB検索は `useEffect` 側が担当するため、ここではURL更新のみ行う。`autoOpen=1` フラグをURLに付与することで、1件ヒット時の自動遷移を制御する。

### `useEffect`（`searchParams` 依存）

URLクエリパラメータの変化を検知してDB検索を実行する。
- クエリが空 → 検索画面表示（`showResults=false`）
- 1件ヒット + `autoOpen=1` → 自動的に商品詳細ページへ遷移
- 複数件ヒット → `searchResults` stateに格納して一覧表示

### `handleBackToSearch()`

検索結果画面から検索フォーム画面に戻る。`showResults=false`、`searchResults=[]` にリセットする。

### `determineName(group, id)`

`group`（0=学科, 1=学期, 2=科目）と `id` を受け取り、対応するマスターデータ（`getName`/`getPeriod`/`getSubject`）からラベル文字列を返す。検索結果画面の「検索ワード」表示に使用する。
