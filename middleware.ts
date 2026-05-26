//NextResponseはリダイレクト用のreturnに使う。Cookieの更新はsupabaseResponseが担当するので注意
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const PROTECTED_PATH = '/purchase';
const LOGIN_PATH = '/signin';

export async function middleware(request: NextRequest) {
  // Supabaseのセッション情報を取得
  //このrequestの中には、URLやクッキー情報が含まれている
  const { supabaseResponse, user } = await updateSession(request);
  //なぜgetUserではなくupdateSessionを使うかというと、getUserは単にユーザー情報を取得するだけだが、
  // updateSessionはクッキーの自動更新も行うため、セッション管理に必要だから

  const isAuthenticated = !!user; // userが存在すれば認証済み
  //userが認証済みというのは、一つ前のrequestの中にCookieが含まれていて、かつそのCookieがsupabase側で有効と判断された場合

  // --- A. ルートパスの制御 ---

  // アプリケーションのルート (/) にアクセスされた場合
  //request.urlは完全なフルurl, request.nextUrl.pathnameは「/」のようなパス部分のみ
  if (request.nextUrl.pathname === '/') {
    // 未認証なら /signin へ、認証済みなら /purchase へリダイレクト
    const url = new URL(isAuthenticated ? PROTECTED_PATH : LOGIN_PATH, request.url);
    return NextResponse.redirect(url);
  }

  // --- B. 認証ガードのロジック ( /purchase へのアクセス制御 ) ---

  // ログイン有効時間切れ（未認証）の場合
  if (!isAuthenticated) {
    // アクセスしようとしているパスが /purchase またはその配下の場合
    if (request.nextUrl.pathname.startsWith(PROTECTED_PATH)) {

      // サインインページへのリダイレクトを強制
      const url = new URL(LOGIN_PATH, request.url);
      return NextResponse.redirect(url);
    }
  }

  // 認証済みの場合、サインインページにアクセスしようとしたら /purchase へリダイレクト
  if (isAuthenticated && request.nextUrl.pathname === LOGIN_PATH) {
    const url = new URL(PROTECTED_PATH, request.url);
    return NextResponse.redirect(url);
  }

  // 認証済み、かつアクセスが許可されている場合、Supabaseのレスポンスを返す
  //ミドルウェアの最後は、リダイレクトしないなら更新済みのsupabaseResponseを返すようにするのが一般的
  //このreturnが出るのは、認証済みでpurchase配下にアクセスするときと、未認証でsigninにアクセスするとき
  return supabaseResponse;
}

// ミドルウェアを実行するパスを指定 (ルートとpurchase配下を監視)
export const config = {
  matcher: [
    '/',
    '/purchase/:path*', // purchase とその配下の全て
    '/signin', // signin ページも監視対象に加える
  ],
};
