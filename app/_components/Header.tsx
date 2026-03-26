// "use client" : useState / useEffect を使うためクライアントコンポーネントにする
"use client";

import { useState, useEffect } from "react";
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

  // isOpen: モバイルメニューの開閉状態（true = 開いている）
  const [isOpen, setIsOpen] = useState(false);

  // Escape キーでメニューを閉じる（キーボード操作アクセシビリティ対応）
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    // クリーンアップ: コンポーネント破棄時にリスナーを解除する
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

        {/* ナビゲーション：sm 以上でのみ表示（スマホでは非表示） */}
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

        {/* 右端エリア：予約CTAボタン + ハンバーガーボタン */}
        <div className="flex shrink-0 items-center gap-2">
          {/*
           * 予約 CTA ボタン：常時表示
           * - NEXT_PUBLIC_BOOKING_URL 未設定時は「準備中」として無効化される
           * - external=true で別タブ（予約サイト）として開く
           */}
          <CTAButton
            variant="primary"
            size="sm"
            href={SITE.bookingUrl}
            external
          >
            ご予約
          </CTAButton>

          {/*
           * ハンバーガーボタン：sm 未満（スマホ）でのみ表示
           * - aria-expanded / aria-controls でスクリーンリーダー対応
           * - 開いている間は ✕ アイコン、閉じている間は ☰ アイコン
           */}
          <button
            type="button"
            className="sm:hidden rounded-md p-2 text-stone-700 hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {/* 開状態: ✕（閉じるアイコン） */}
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              /* 閉状態: ☰（ハンバーガーアイコン） */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/*
       * モバイルメニュー本体
       * - isOpen が true のときだけレンダリング（sm 以上では sm:hidden で非表示）
       * - ナビリンク一覧 + 予約CTAボタンを縦並びで表示
       */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="sm:hidden border-t border-stone-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/90"
        >
          <nav aria-label="モバイルナビゲーション">
            <ul className="flex flex-col gap-1 px-4 py-3">
              {items.map((item) => (
                <li key={item.key}>
                  {item.disabled || !item.href ? (
                    <DisabledItem label={item.label} />
                  ) : (
                    // リンクをタップしたらメニューを閉じる
                    <a
                      href={item.href}
                      className="block py-2 text-sm font-medium text-stone-900 underline-offset-4 hover:underline dark:text-zinc-50"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
              {/* モバイルメニュー内の予約CTAボタン（Issue #73 AC: メニュー内に含める） */}
              <li className="pt-2">
                <CTAButton
                  variant="primary"
                  size="md"
                  href={SITE.bookingUrl}
                  external
                >
                  ご予約
                </CTAButton>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
