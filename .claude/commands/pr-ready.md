---
description: PR提出前の最終チェック（ビルド確認・差分確認・TASKS.md更新・PR文生成・gh pr create）
argument-hint: （省略可）ベースブランチ名（デフォルト: develop）
---

# PR Ready Workflow

コーディング完了からPR作成までを一本化する。
`/coding` → `/check-progress` → `/pr-ready` の3ステップでブランチを出口まで導く。

---

## Phase 1: ブランチ・差分の確認

**Goal**: 今のブランチで何を変更したかを正確に把握する

**Actions**:
1. 現在のブランチとベースブランチを確認する
   ```bash
   git branch --show-current
   git log --oneline origin/develop..HEAD
   ```
2. `$ARGUMENTS` でベースブランチが指定された場合はそれを使う（デフォルトは `develop`）
3. 変更ファイルの一覧と差分を確認する
   ```bash
   git diff origin/develop...HEAD --stat
   git diff origin/develop...HEAD
   ```
4. 意図しないファイルの変更が含まれていないか確認する
   - `.env.local` など機密ファイルが混入していないか
   - 作業範囲外のファイルが変更されていないか
5. 問題があればユーザーに報告し、修正を促してから次のフェーズへ進む

---

## Phase 2: ビルド確認

**Goal**: PRを出す前にビルドエラーがないことを確認する

**Actions**:
1. 型チェックを実行する
   ```bash
   npx tsc --noEmit
   ```
2. ESLintを実行する
   ```bash
   npm run lint
   ```
3. エラーがある場合はユーザーに報告し、修正を促す
4. **エラーが残ったままPRを作成しない**

---

## Phase 3: TASKS.md のステータス確認

**Goal**: 今回の実装に対応するタスクが `[x]` になっているか確認する

**Actions**:
1. `.claude/TASKS.md` を読み込む
2. Phase 1 の変更内容に対応するタスクを特定する
3. 未完了（`[ ]`）のまま残っているタスクがあればユーザーに確認する
   - 意図的に残している場合: そのまま進む
   - 更新漏れの場合: `[x]` に変更し `**完了コミット**: <hash>` を追記する

---

## Phase 4: PR文の生成

**Goal**: レビュアーに伝わるPR文を作成する

**Actions**:
1. Phase 1〜3 の情報をもとに以下のフォーマットでPR文を下書きする

```markdown
## 概要
<!-- 何をしたか・なぜしたか を2〜3行で -->

## 変更内容
- ファイル名: 変更の要点

## 動作確認
- [ ] （確認してほしい画面・操作を箇条書き）

## 関連タスク
- TASKS.md: 機能○○

## スクリーンショット
<!-- あれば添付 -->
```

2. 下書きをユーザーに提示し、修正があれば反映する
3. **ユーザーの承認なしにPRを作成しない**

---

## Phase 5: PR の作成

**Goal**: `gh` コマンドでPRを作成する

**Actions**:
1. リモートにプッシュ済みか確認する
   ```bash
   git status
   git log origin/<branch>..HEAD 2>/dev/null | head -5
   ```
2. 未プッシュの場合はプッシュする
   ```bash
   git push origin <branch>
   ```
3. PRを作成する
   ```bash
   gh pr create \
     --base develop \
     --title "<タイトル>" \
     --body "$(cat <<'EOF'
   <Phase 4 で生成した本文>
   EOF
   )"
   ```
4. 作成されたPRのURLをユーザーに伝える

---

## Phase 6: 完了報告

**Goal**: PR作成後の状態を簡潔に伝える

**Actions**:
1. PRのURLと対象ブランチを報告する
2. レビュー依頼が必要な相手がいればユーザーに確認する
3. マージ後にworktreeを削除するコマンドを提示する（必要な場合）
   ```bash
   git worktree remove ../<directory>
   git branch -d <branch>
   ```
