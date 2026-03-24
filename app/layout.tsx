import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "./_components/Footer";
import { Header } from "./_components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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
