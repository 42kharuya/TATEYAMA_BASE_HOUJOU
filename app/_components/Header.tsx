import Link from "next/link";
import { getHeaderNavItems } from "../_lib/navigation";
import { SITE } from "../_lib/site";
import { CTAButton } from "./CTAButton";

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-stone-900 underline-offset-4 hover:underline dark:text-zinc-50"
    >
      {children}
    </a>
  );
}

function DisabledItem({ label }: { label: string }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-zinc-400"
      title="準備中"
    >
      <span>{label}</span>
      <span className="rounded-md border border-stone-200 px-2 py-0.5 text-xs dark:border-zinc-800">
        準備中
      </span>
    </span>
  );
}

export function Header() {
  const items = getHeaderNavItems();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* サイト名ロゴ：左端固定 */}
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold tracking-tight text-stone-900 dark:text-zinc-50"
        >
          {SITE.name}
        </Link>

        {/* ナビゲーション：スマホでは非表示、sm 以上で表示 */}
        <nav aria-label="主要ナビゲーション" className="hidden sm:block">
          <ul className="flex items-center gap-4">
            {items.map((item) => (
              <li key={item.key}>
                {item.disabled || !item.href ? (
                  <DisabledItem label={item.label} />
                ) : (
                  <HeaderLink href={item.href}>{item.label}</HeaderLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/*
         * 予約 CTA ボタン：右端固定
         * - NEXT_PUBLIC_BOOKING_URL 未設定時は「準備中」として無効化される
         * - shrink-0 でロゴ・ナビが溢れてもボタンが潰れないようにする
         * - external=true で別タブ（予約サイト）として開く
         */}
        <div className="shrink-0">
          <CTAButton
            variant="primary"
            size="sm"
            href={SITE.bookingUrl}
            external
          >
            ご予約
          </CTAButton>
        </div>
      </div>
    </header>
  );
}
