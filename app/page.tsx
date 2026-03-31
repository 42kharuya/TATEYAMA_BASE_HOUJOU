import type { Metadata } from "next";
import { AboutSection } from "./_components/AboutSection";
import { AccessSection } from "./_components/AccessSection";
import { CTAButton } from "./_components/CTAButton";
import { FacilitiesSection } from "./_components/FacilitiesSection";
import { FadeIn } from "./_components/FadeIn";
import { FeaturesSection } from "./_components/FeaturesSection";
import { GallerySection } from "./_components/GallerySection";
import { Hero } from "./_components/Hero";
import { PricingSection } from "./_components/PricingSection";
import { Section } from "./_components/Section";
import { ANCHOR_IDS } from "./_lib/anchors";
import { SITE } from "./_lib/site";

// トップページ固有の metadata を定義する。
// layout.tsx の title.template ("%s | TATEYAMA BASE 北条") を上書きし、
// absolute を使うことでサイト名が二重にならないようにする。
export const metadata: Metadata = {
  title: {
    // absolute: テンプレートを無視してこのタイトルをそのまま使う
    absolute: "TATEYAMA BASE 北条 | 館山・北条海岸の1棟貸し貸別荘",
  },
  description:
    "千葉県館山市の貸別荘「TATEYAMA BASE 北条」。海まで徒歩約2分、館山駅から徒歩約9分。4〜8名で泊まれる1棟貸し。屋上テラス・ウッドデッキ・室内アクティビティ充実。",
  // openGraph: SNS（X・Facebook等）でシェアされたときに表示される情報
  // images は OGP 用画像が確定したら追加する（現時点はプレースホルダー）
  openGraph: {
    title: "TATEYAMA BASE 北条 | 館山・北条海岸の1棟貸し貸別荘",
    description:
      "千葉県館山市の貸別荘「TATEYAMA BASE 北条」。海まで徒歩約2分、館山駅から徒歩約9分。4〜8名で泊まれる1棟貸し。屋上テラス・ウッドデッキ・室内アクティビティ充実。",
    url: "/",
    // OGP画像は公開前に追加予定。追加時は public/ogp.png を配置して下記を有効化:
    // images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "TATEYAMA BASE 北条" }],
  },
};

export default function Home() {
  // 予約 URL が設定されているかを確認する（未設定時は CTAButton が「準備中」を表示）
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero: ファーストビュー（画像・コピー・予約 CTA） */}
      <Hero />

      {/* About: TATEYAMA BASE 北条
       * 写真 + テキストで施設の全体像を伝えるセクション
       */}
      <AboutSection />

      {/* Features: 特徴（魅力）
       * 1棟貸し・屋上テラス・室内アクティビティ・レンタル・立地
       * IA.md セクション順 3番め（Summary の後・設備の前）
       * FadeIn: スクロールで表示域に入ったタイミングでフェードイン（Issue #76）
       */}
      <FadeIn>
        <FeaturesSection />
      </FadeIn>

      {/* Gallery: 体験ギャラリー（Issue #105）
       * 実際の宿泊者がSUP・海水浴・釣りなどを楽しんでいる様子をマソンリーグリッドで表示。
       * FeaturesSection（設備の機能説明）に続いて「実際の体験者で共感」させるソーシャルプルーフ。
       * IA.md セクション順: FeaturesSection の後・FacilitiesSection の前
       */}
      <FadeIn>
        <GallerySection />
      </FadeIn>

      {/* Facilities: 設備セクション（フロア別一覧）
       * 屋外・1階・2階・屋上・その他の設備を一覧表示
       * IA.md セクション順 4番め（特徴の後・料金の前）
       */}
      <FadeIn>
        <FacilitiesSection />
      </FadeIn>

      {/* Pricing: 宿泊料金・キャンセルポリシー・レンタル料金
       * IA.md セクション順 5番め（設備の後・アクセスの前）
       */}
      <FadeIn>
        <PricingSection />
      </FadeIn>

      {/* Access: 住所・地図 CTA・最寄り・交通手段 */}
      <FadeIn>
        <AccessSection />
      </FadeIn>

      {/* Booking: 予約・問い合わせ CTA（ページ下部で再掲） */}
      {/*
       * variant="accent-dark": bg-sky-700 の濃いブルー帯で予約 CTA を際立たせる（Issue #25）
       * 隣の AccessSection（tinted）とコントラストをつけ、「状態が変わった」ことを視覚的に伝える
       */}
      <FadeIn>
        <Section
          id={ANCHOR_IDS.booking}
          title="予約・問い合わせ"
          lead="ご予約は外部サービス（STORES）から承ります。ご不明な点はお気軽に LINE でお問い合わせください。"
          variant="accent-dark"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/*
             * 予約 CTA（最重要）
             * variant="outlined-white": accent-dark 帯の上で白枠で際立たせる（Issue #25）
             * NEXT_PUBLIC_BOOKING_URL 未設定時は「準備中」で自動的に無効化される
             */}
            <CTAButton
              variant="outlined-white"
              href={bookingUrl}
              external
              description={
                !bookingUrl ? "予約（STORES）は準備中です。" : undefined
              }
            >
              ご宿泊予約
            </CTAButton>

            {/*
             * LINE 問い合わせ CTA（補助）
             * variant="outlined-white": accent-dark 帯の上で白枠、予約ボタンとスタイルを揃える（Issue #25）
             * NEXT_PUBLIC_LINE_URL 未設定時は「準備中」で自動的に無効化される
             */}
            <CTAButton
              variant="outlined-white"
              href={SITE.lineUrl}
              external
              description={
                !SITE.lineUrl ? "LINE は準備中です。" : undefined
              }
            >
              LINEで問い合わせ
            </CTAButton>
          </div>
        </Section>
      </FadeIn>
    </div>
  );
}
