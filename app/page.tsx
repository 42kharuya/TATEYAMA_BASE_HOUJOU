import { Section } from "./_components/Section";
import { ANCHOR_IDS, anchorHref } from "./_lib/anchors";
import { getFooterCtaItems } from "./_lib/navigation";
import { SITE } from "./_lib/site";

export default function Home() {
  const ctas = getFooterCtaItems();

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-14 sm:px-6 sm:py-16">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{SITE.name}</h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            館山駅から徒歩約9分、海まで徒歩約30秒。4〜8名で泊まれる1棟貸しの貸別荘です。
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={anchorHref("pricing")}
              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              料金を見る
            </a>
            <a
              href={anchorHref("access")}
              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              アクセスを見る
            </a>
            <a
              href={anchorHref("booking")}
              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              予約・問い合わせへ
            </a>
          </div>
        </div>
      </div>

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
          {ctas.map((cta) =>
            cta.disabled || !cta.href ? (
              <span
                key={cta.key}
                aria-disabled="true"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-200 px-4 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                title="準備中"
              >
                {cta.label}（準備中）
              </span>
            ) : (
              <a
                key={cta.key}
                href={cta.href}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-950"
              >
                {cta.label}
              </a>
            ),
          )}
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            予約URLが未設定の場合は「準備中」と表示されます。
          </p>
        </div>
      </Section>
    </div>
  );
}
