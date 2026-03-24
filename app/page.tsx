import { AccessSection } from "./_components/AccessSection";
import { CTAButton } from "./_components/CTAButton";
import { GallerySection } from "./_components/GallerySection";
import { Hero } from "./_components/Hero";
import { PricingSection } from "./_components/PricingSection";
import { Section } from "./_components/Section";
import { ANCHOR_IDS } from "./_lib/anchors";
import { SITE } from "./_lib/site";

export default function Home() {
  // 予約 URL が設定されているかを確認する（未設定時は CTAButton が「準備中」を表示）
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero: ファーストビュー（画像・コピー・予約 CTA） */}
      <Hero />

      {/* Gallery: カテゴリ別写真ギャラリー + Lightbox */}
      <GallerySection />

      {/* Pricing: 宿泊料金・キャンセルポリシー・レンタル料金 */}
      <PricingSection />

      {/* Access: 住所・地図 CTA・最寄り・交通手段 */}
      <AccessSection />

      {/* Booking: 予約・問い合わせ CTA（ページ下部で再掲） */}
      <Section
        id={ANCHOR_IDS.booking}
        title="予約・問い合わせ"
        lead="ご予約は外部サービス（STORES）から承ります。ご不明な点はお気軽に LINE でお問い合わせください。"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {/*
           * 予約 CTA（最重要）
           * NEXT_PUBLIC_BOOKING_URL 未設定時は「準備中」で自動的に無効化される
           */}
          <CTAButton
            variant="primary"
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
           * NEXT_PUBLIC_LINE_URL 未設定時は「準備中」で自動的に無効化される
           */}
          <CTAButton
            variant="secondary"
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
    </div>
  );
}
