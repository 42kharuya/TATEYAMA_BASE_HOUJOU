import { anchorHref } from "../_lib/anchors";
import { getFooterCtaItems } from "../_lib/navigation";
import { SITE } from "../_lib/site";

function FooterButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      /*
       * bg-sky-600: 海ブルー（Issue #23 ブランドカラー）を Footer の主要 CTA にも適用
       */
      className="inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:opacity-90 dark:bg-sky-500 dark:text-white"
    >
      {children}
    </a>
  );
}

function DisabledButton({ label }: { label: string }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex h-11 items-center justify-center rounded-lg bg-stone-200 px-4 text-sm font-medium text-stone-600 dark:bg-zinc-800 dark:text-zinc-300"
      title="準備中"
    >
      {label}（準備中）
    </span>
  );
}

export function Footer() {
  const ctas = getFooterCtaItems();
  const bookingAnchor = anchorHref("booking");

  return (
    <footer className="border-t border-stone-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-stone-900 dark:text-zinc-50">
              {SITE.name}
            </div>
            <div className="text-sm text-stone-600 dark:text-zinc-400">{SITE.address}</div>
            <a
              href={SITE.mapUrl}
              className="text-sm font-medium text-sky-700 underline-offset-4 hover:text-sky-800 hover:underline dark:text-sky-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              地図（Googleマップ）
            </a>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-stone-900 dark:text-zinc-50">
              予約
            </div>
            <div className="flex flex-col items-start gap-3">
              {ctas.map((cta) =>
                cta.disabled || !cta.href ? (
                  <DisabledButton key={cta.key} label={cta.label} />
                ) : (
                  <FooterButton key={cta.key} href={cta.href}>
                    {cta.label}
                  </FooterButton>
                ),
              )}
              <a
                href={bookingAnchor}
                className="text-sm text-stone-600 underline-offset-4 hover:underline dark:text-zinc-400"
              >
                予約・問い合わせセクションへ
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-stone-500 dark:text-zinc-500">
          © {new Date().getFullYear()} {SITE.name}
        </div>
      </div>
    </footer>
  );
}
