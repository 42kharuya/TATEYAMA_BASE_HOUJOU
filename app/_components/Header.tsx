import Link from "next/link";
import { getHeaderNavItems } from "../_lib/navigation";
import { SITE } from "../_lib/site";

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
      className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
    >
      {children}
    </a>
  );
}

function DisabledItem({ label }: { label: string }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400"
      title="準備中"
    >
      <span>{label}</span>
      <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-xs dark:border-zinc-800">
        準備中
      </span>
    </span>
  );
}

export function Header() {
  const items = getHeaderNavItems();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          {SITE.name}
        </Link>

        <nav aria-label="主要ナビゲーション">
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
      </div>
    </header>
  );
}
