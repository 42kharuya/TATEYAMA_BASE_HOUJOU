import type { Metadata } from "next";
// Shippori Mincho: 繊細な明朝体。和の上品さ・高級リゾート感を演出するセリフ体
// 参考: https://fonts.google.com/specimen/Shippori+Mincho
import { Shippori_Mincho } from "next/font/google";
import "./globals.css";
import { Footer } from "./_components/Footer";
import { Header } from "./_components/Header";

// display: "swap" → フォント未読込み中は代替フォントを表示し、読み込み完了後に切り替える（表示の安定性向上）
// preload: false  → 日本語フォントはファイルサイズが大きいため、先読みせず必要な文字だけ遅延ロードする
const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  // metadataBase: OGP画像など相対URLを絶対URLに変換するベースURL
  // NEXT_PUBLIC_SITE_URL が未設定/空文字の場合は開発用の localhost:3000 にフォールバック
  // 注意: ?? ではなく || を使う（空文字列も falsy として扱うため）
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    // default: 各ページで title が未定義の場合に使われるタイトル（フォールバック）
    default: "TATEYAMA BASE 北条",
    // template: 各ページで title を定義すると「{ページ title} | TATEYAMA BASE 北条」 の形になる
    template: "%s | TATEYAMA BASE 北条",
  },
  // openGraph: SNS シェア時に使われるサイト共通情報（ページ固有値は各 page.tsx で上書き）
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "TATEYAMA BASE 北条",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${shipporiMincho.variable} h-full antialiased`}>
      {/* bg-stone-50: 砂浜のオフホワイト（Issue #23 ブランドカラー導入）
           text-stone-900: 読みやすい濃いテキスト */}
      <body className="flex min-h-full flex-col bg-stone-50 font-sans text-stone-900 dark:bg-black dark:text-zinc-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
