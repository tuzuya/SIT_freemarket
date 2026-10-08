/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // 型エラー・lint エラーを無視する設定は削除した（型エラー0を確認済み）。
  // エラーがあるとビルドが止まるので、バグを本番に出す前に気づける
};

export default nextConfig;
