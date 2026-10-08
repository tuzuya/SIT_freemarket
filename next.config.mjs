/** @type {import('next').NextConfig} */
// 全レスポンスに付ける防御用ヘッダー。
// CSP は Supabase などの接続先の列挙が要り、誤ると画面が壊れるので別途確認しながら入れる
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // 型エラー・lint エラーを無視する設定は削除した（型エラー0を確認済み）。
  // エラーがあるとビルドが止まるので、バグを本番に出す前に気づける
};

export default nextConfig;
