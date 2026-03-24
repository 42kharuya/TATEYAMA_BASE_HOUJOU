/**
 * Lightbox — 画像拡大表示モーダルコンポーネント
 *
 * 役割: サムネイルをクリックした画像を全画面で拡大表示する。
 *
 * アクセシビリティ要件（docs/DESIGN.md 8.6 より）:
 *   - × / Esc / 背景クリックで閉じる
 *   - 次へ / 前へ（ボタン + ← / →）
 *   - フォーカストラップ（モーダル内に Tab 移動を閉じ込める）
 *   - フォーカス復帰（閉じたとき開いた元のサムネイルにフォーカスを戻す）
 *   - 背景スクロール停止（body scroll lock）
 *   - role="dialog" + aria-modal="true"
 *
 * 用語:
 *   - フォーカストラップ: モーダル表示中に Tab で移動しても外へ焦点が逃げない仕組み。
 *   - フォーカス復帰: モーダルを閉じた後、開いた元の要素へ焦点を戻すこと。
 *   - body scroll lock: モーダル表示中に背景がスクロールしないよう body に overflow-hidden をあてること。
 */

"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef } from "react";

// ----------------------------------------------------------------
// 型定義
// ----------------------------------------------------------------

/** ライトボックスに渡す 1 枚分のデータ */
export type LightboxImage = {
  src: StaticImageData | string;
  alt: string;
};

type Props = {
  /** 表示する画像の配列 */
  images: LightboxImage[];
  /** 現在表示中のインデックス（null = 非表示） */
  currentIndex: number | null;
  /** 閉じる操作が発生したときに呼ぶコールバック */
  onClose: () => void;
  /** 次へ操作が発生したときに呼ぶコールバック */
  onNext: () => void;
  /** 前へ操作が発生したときに呼ぶコールバック */
  onPrev: () => void;
};

// ----------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------

export function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: Props) {
  /** ダイアログ要素への参照（フォーカストラップに使用） */
  const dialogRef = useRef<HTMLDivElement>(null);
  /** 閉じるボタンへの参照（開いたとき最初にフォーカスをあてる） */
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 現在の画像情報
  const isOpen = currentIndex !== null;
  const current = isOpen ? images[currentIndex] : null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex !== null && currentIndex === images.length - 1;

  // ---- 背景スクロール停止 ----
  // モーダルが開いている間 body に overflow-hidden をあててスクロールを止める
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // クリーンアップ: コンポーネント破棄時にも元に戻す
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ---- 開いたときにフォーカスを閉じるボタンへ移動 ----
  useEffect(() => {
    if (isOpen) {
      // レンダリング後に DOM が確定してからフォーカスをあてる
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    }
  }, [isOpen]);

  // ---- キーボード操作 ----
  // Esc: 閉じる / ArrowRight: 次へ / ArrowLeft: 前へ
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          if (!isLast) onNext();
          break;
        case "ArrowLeft":
          if (!isFirst) onPrev();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFirst, isLast, onClose, onNext, onPrev]);

  // ---- フォーカストラップ ----
  // Tab / Shift+Tab でフォーカスがモーダル外へ逃げないようにする
  const handleKeyDownTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // フォーカス可能な要素を取得（disabled な要素を除く）
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: 先頭にいたら末尾へ折り返す
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: 末尾にいたら先頭へ折り返す
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // ---- 背景クリック処理 ----
  // オーバーレイのみクリックで閉じる（画像部分のクリックは通過させない）
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // 非表示のときは何もレンダリングしない（DOM に残さない）
  if (!isOpen || !current) return null;

  return (
    /*
     * ライトボックスのオーバーレイ（背景）
     * - fixed inset-0: 画面全体を覆う
     * - z-50: 他のすべての要素より手前に表示する
     * - role="dialog" + aria-modal="true": スクリーンリーダーにダイアログとして伝える
     */
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="画像の拡大表示"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDownTrap}
    >
      {/* ---- 閉じるボタン（右上） ---- */}
      <button
        ref={closeButtonRef}
        aria-label="閉じる"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        {/* × のアイコン（SVG）*/}
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* ---- 前へボタン（左） ---- */}
      <button
        aria-label="前の写真"
        onClick={onPrev}
        disabled={isFirst}
        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-30 sm:left-4"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* ---- 拡大画像エリア ---- */}
      {/*
       * オーバーレイをクリックしても閉じないよう e.stopPropagation() を使う
       * （handleBackdropClick は e.target === e.currentTarget でオーバーレイのみ閉じる設計だが、
       *   明示的に停止することで意図を明確にする）
       */}
      <div
        className="relative mx-4 max-h-[90vh] w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={currentIndex} // インデックス変化でアニメーションをリセット
          src={current.src}
          alt={current.alt}
          width={1200}
          height={800}
          className="mx-auto max-h-[90vh] w-auto rounded-xl object-contain shadow-2xl"
          sizes="(max-width: 768px) 100vw, 80vw"
        />

        {/* ---- カウンター（現在位置 / 合計） ---- */}
        <p
          aria-live="polite"
          className="mt-3 text-center text-sm text-white/70"
        >
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* ---- 次へボタン（右） ---- */}
      <button
        aria-label="次の写真"
        onClick={onNext}
        disabled={isLast}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-30 sm:right-4"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
