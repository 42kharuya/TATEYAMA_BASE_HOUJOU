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
  title: "TATEYAMA BASE 北条 | 館山・北条海岸の1棟貸し貸別荘",
  description:
    "千葉県館山市の貸別荘「TATEYAMA BASE 北条」。海まで徒歩約30秒、館山駅から徒歩約9分。4〜8名で泊まれる1棟貸し。屋上テラス・ウッドデッキ・室内アクティビティ充実。",
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
