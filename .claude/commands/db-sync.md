---
description: コードから全テーブル・カラムを収集し、ARCHITECTURE.mdのスキーマ定義を最新状態に同期する
argument-hint: （省略可）対象ブランチ名
---

# DB Sync Workflow

Supabaseへのクエリをコード全体からスキャンし、ARCHITECTURE.md のスキーマ表と突き合わせて差分を検出・修正する。
マイグレーションファイルを持たないこのプロジェクトでは、コードが唯一のスキーマの正として機能する。

---

## Phase 1: コードからスキーマをスキャン

**Goal**: 全ブランチのコードから、実際に使われているテーブル・カラムを網羅的に収集する

**Actions**:

### 1-1. 対象ブランチを決める
- `$ARGUMENTS` が指定された場合はそのブランチのみ
- 指定がない場合は全ブランチを対象とする
  ```bash
  git branch -a
  ```

### 1-2. テーブル名の収集
現在のワーキングツリーと、差分のあるブランチをそれぞれスキャンする。

**ワーキングツリー:**
```bash
grep -rn "\.from(" src/ --include="*.ts" --include="*.tsx" | grep -v "Array.from"
```

**他ブランチ（ワーキングツリーにない変更があるブランチ）:**
```bash
git log --all --oneline --decorate
# 各ブランチの .from( 呼び出しを確認
git show <branch>:<file> | grep "\.from("
```

### 1-3. カラム名の収集（テーブルごと）

各テーブルについて、以下の4パターンからカラムを収集する:

**① INSERT で書き込んでいるカラム:**
```bash
grep -A 20 "\.from(\"<table>\").*insert\|\.insert(" src/ -rn --include="*.ts" --include="*.tsx"
```

**② UPDATE で書き込んでいるカラム:**
```bash
grep -A 10 "\.from(\"<table>\").*update\|\.update({" src/ -rn --include="*.ts" --include="*.tsx"
```

**③ SELECT で読んでいるカラム:**
```bash
grep -n "\.select(" src/ -rn --include="*.ts" --include="*.tsx"
```

**④ TypeScript interface / type 定義:**
```bash
grep -B 2 -A 20 "^interface\|^type " src/ -rn --include="*.ts" --include="*.tsx" | grep -A 15 "Transaction\|Merchandise\|Profile\|Favorite\|Message\|Report"
```

**⑤ .eq() / .in() のフィルターカラム:**
```bash
grep -n "\.eq(\|\.in(\|\.order(" src/ -rn --include="*.ts" --include="*.tsx" | grep -v node_modules
```

### 1-4. Supabase Storage バケットの収集
```bash
grep -rn "storage.*from(\|\.upload(\|\.getPublicUrl(" src/ --include="*.ts" --include="*.tsx"
```

### 1-5. 収集結果を以下のフォーマットでまとめる

```
【テーブル: merchandises】
  カラム (INSERT): name, price, image_url, description, seller_id, course_id, semester_id, subject_id, state_id, deliveryMethod_id, status, buyer_id
  カラム (UPDATE): status, buyer_id
  カラム (SELECT): id, name, price, image_url, status, seller_id, description
  カラム (interface): id, name, price, image_url, description, seller_id, status
  確認ファイル: SellForm.tsx, PurchasePageClient.tsx, checkout/[id]/page.tsx

【テーブル: transactions】（ブランチ: feature/purchase-flow）
  カラム (INSERT): merchandise_id, buyer_id, seller_id, delivery_method, status
  カラム (UPDATE): status
  カラム (SELECT): id, merchandise_id, buyer_id, seller_id, delivery_method, status, created_at
  カラム (interface): id, merchandise_id, buyer_id, seller_id, delivery_method, status, created_at
  確認ファイル: checkout/[id]/page.tsx, transactions/page.tsx, transactions/[id]/page.tsx

【Storage バケット: images】
  操作: upload, getPublicUrl
  確認ファイル: SellForm.tsx
```

---

## Phase 2: ARCHITECTURE.md の現状を読む

**Goal**: 現在ドキュメント化されているスキーマを把握する

**Actions**:
1. `ARCHITECTURE.md` の「Supabase テーブル構成」セクションを読む
2. 現在記載されているテーブル・カラムをリストアップする
3. `TASKS.md` の実装メモに書かれた「近日追加予定」のテーブルも確認する
   - 例: `favorites (user_id, merchandise_id, created_at)` など

---

## Phase 3: 差分の検出

**Goal**: ドキュメントとコードの乖離をすべて特定する

**検出する差分の種類:**

| 種類 | 内容 |
|------|------|
| 新規テーブル | コードにあるがドキュメントに未記載のテーブル |
| 新規カラム | 既存テーブルにコードで使われているが未記載のカラム |
| ステータス値 | `status` などの取りうる値がドキュメントに未記載 |
| 削除/廃止 | ドキュメントにあるがコードで一切使われていないカラム |
| Storage追加 | 新規バケットがドキュメントに未記載 |
| 型の更新 | コード上の型推測からドキュメントの型を修正すべきもの |

**差分の出力フォーマット:**
```
[新規テーブル] transactions
  発見場所: feature/purchase-flow ブランチ
  カラム: id, merchandise_id, buyer_id, seller_id, delivery_method, status, created_at
  status の取りうる値: pending / trading / completed

[新規カラム] merchandises.status, merchandises.buyer_id
  発見場所: feature/purchase-flow ブランチ (checkout/[id]/page.tsx)
  status の取りうる値: available / pending / trading / sold

[未確認] 型情報が不明なカラム
  → ユーザーに確認する
```

---

## Phase 4: 差分の提示と確認

**Goal**: 検出した差分をユーザーに提示し、修正内容を確認する

**Actions**:
1. Phase 3 の差分を種類別に整理してユーザーに提示する
2. カラムの型（`text`, `uuid`, `integer`, `boolean`, `timestamptz`, `text[]` など）をコードから推測して候補を出す:
   - `string` → `text` または `uuid`
   - `number` → `integer` または `numeric`
   - `string[]` / `image_url: string[]` → `text[]`
   - `created_at` → `timestamptz`
   - UUID形式の参照 → `uuid references <table>(id)`
3. 推測が難しい型はユーザーに質問する
4. **ユーザーの承認なしに ARCHITECTURE.md を修正しない**

---

## Phase 5: ARCHITECTURE.md の更新

**Goal**: 承認された差分を ARCHITECTURE.md に反映する

**更新対象セクション:**
- `## Supabase テーブル構成` — テーブル・カラムの表を更新
- `## ページルーティングと認証フロー` — 新規ページが増えていれば追記
- `## ディレクトリ構成` — 新規ディレクトリ・ファイルがあれば追記

**スキーマ表のフォーマット（現行に合わせる）:**
```markdown
| テーブル名 | 主なカラム |
|-----------|-----------|
| `merchandises` | `id`, `name`, `price`, `image_url text[]`, `description`, `seller_id uuid`, `status text (available/pending/trading/sold)`, `buyer_id uuid` |
| `profiles`     | `id uuid` (auth.users), `user_name text` |
| `transactions` | `id`, `merchandise_id uuid`, `buyer_id uuid`, `seller_id uuid`, `delivery_method text`, `status text (pending/trading/completed)`, `created_at timestamptz` |
```

**Storage バケット表（なければ新設）:**
```markdown
| バケット名 | 用途 |
|-----------|------|
| `images`  | 商品画像のアップロード先 |
```

**Rules**:
- 既存の行を書き換えるのではなく、差分部分だけを追記・修正する
- `status` カラムは必ず取りうる値をカッコ内に列挙する（状態遷移の文書化として重要）
- 実装が別ブランチにある場合は `※ feature/xxx ブランチで実装` と注記する
- カラムの型が推測のみの場合は `（推測）` と付記してユーザーが後で修正できるようにする

---

## Phase 6: 完了報告

**Goal**: 何を更新したかを簡潔に伝える

**Actions**:
1. 更新した内容を箇条書きで報告する（テーブル名・追加カラム数）
2. 「型が不明で推測のまま」にしたカラムがあれば列挙する
3. TASKS.md の「近日追加予定テーブル」（favorites / messages / reports）の定義が固まったタイミングで再度 `/db-sync` を実行するよう促す
