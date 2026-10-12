-- 会員登録を芝浦工業大学のメールアドレス（@shibaura-it.ac.jp）に限定する。
--
-- 画面側の validateEmail.ts だけでは、公開されている anon key で Auth API を直接叩けば
-- 任意のメールアドレスで登録できてしまう（SECURITY_REVIEW.md #9）。
-- auth.users への INSERT / メールアドレスの変更を DB 側で拒否し、どの経路から登録しても弾く。
--
-- 適用方法: Supabase ダッシュボードの SQL Editor でこのファイルの中身を実行する。
-- 拒否されると supabase.auth.signUp() は "Database error saving new user" を返す。

create or replace function public.enforce_school_email_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- メールアドレスを持たないユーザー（匿名ログイン・電話番号ログイン）も対象外として拒否する
  if new.email is null or lower(new.email) not like '%@shibaura-it.ac.jp' then
    raise exception '大学のメールアドレス（@shibaura-it.ac.jp）以外では登録できません'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_school_email_domain on auth.users;

create trigger enforce_school_email_domain
  before insert or update of email on auth.users
  for each row
  execute function public.enforce_school_email_domain();

-- 適用前に登録された、大学のメールアドレス以外のユーザーを確認する（削除はしない）:
--   select id, email, created_at from auth.users
--   where email is null or lower(email) not like '%@shibaura-it.ac.jp';
