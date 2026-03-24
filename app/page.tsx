import { CTAButton } from "./_components/CTAButton";
import { Hero } from "./_components/Hero";
import { Section } from "./_components/Section";
import { ANCHOR_IDS } from "./_lib/anchors";
import { SITE } from "./_lib/site";

export default function Home() {
  // 予約 URL が設定されているかを確認する
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero: ファーストビュー（画像・コピー・予約 CTA） */}
      <Hero />

      <Section
        id={ANCHOR_IDS.pricing}
        title="料金"
        lead="料金はシーズンや人数によって変わります。詳細は順次整備します。"
      >
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
          MVPではまず導線と見出し構造を固定し、後続Issueで料金表を実装します。
        </p>
      </Section>

      <Section
        id={ANCHOR_IDS.access}
        title="アクセス"
        lead="住所と地図リンクは固定で掲載します。"
      >
        <div className="space-y-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          <div>{SITE.address}</div>
          <a
            href={SITE.mapUrl}
            className="inline-flex text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            Googleマップで開く
          </a>
        </div>
      </Section>

      <Section
        id={ANCHOR_IDS.booking}
        title="予約・問い合わせ"
        lead="予約は外部サービス（STORES）を利用します。"
      >
        <div className="flex flex-col items-start gap-3">
          {/* CTAButton: URL 未設定時は「準備中」で自動的に無効化される */}
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
        </div>
      </Section>
    </div>
  );
}
