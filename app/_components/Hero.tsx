/**
 * Hero — ファーストビューコンポーネント
 *
 * 役割: ページ最上部で施設の価値と予約導線を即座に伝える。
 *
 * 構成:
 *   1. 背景画像（外観写真: imgs/hero-exterior.jpg）
 *   2. 黒の半透明オーバーレイ（文字視認性を担保）
 *   3. キャッチコピー / サブコピー（docs/CONTENT.md 確定文言）
 *   4. 主要 CTA（ご宿泊予約 / 準備中フォールバック）
 *   5. スクロール促進矢印（バウンスアニメーション付き。スクロールでフェードアウト）
 *   ※ ページ内ナビは Header（スクロール追従）に委ねる
 *
 * 画像最適化:
 *   - next/image の priority prop でファーストビューの LCP を改善する
 *     （LCP = Largest Contentful Paint: 最大要素の表示速度。SEO と UX の指標）
 *
 * 環境変数:
 *   - NEXT_PUBLIC_BOOKING_URL: 未設定時は「準備中」で CTA を無効化する
 *
 * "use client" の理由:
 *   - scroll イベントリスナーを使うためブラウザ専用の処理が必要。
 *   - NEXT_PUBLIC_ 環境変数はクライアントコンポーネントでも参照可能。
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import heroImage from "../../imgs/hero-exterior.jpg";
import { CTAButton } from "./CTAButton";

// ---- コンテンツ定数（docs/CONTENT.md の確定文言を使用） ----

/** h1 に載せるキャッチコピー */
const CATCH_COPY = "海も観光も\nアクティビティも\n遊びのベースキャンプ";

/** キャッチコピー直下のサブコピー */
const SUB_COPY = "館山・北条海岸の1棟貸しを4〜8名で独占できます。";

export function Hero() {
  // NEXT_PUBLIC_BOOKING_URL が未設定の場合は undefined になる
  // → CTAButton に渡すと「準備中」フォールバックが動く
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  // ---- スクロール矢印の表示制御 ----
  // スクロール量が 50px を超えたら矢印を非表示にする
  // useState の初期値 true = ページ読み込み時は表示
  const [arrowVisible, setArrowVisible] = useState(true);

  useEffect(() => {
    // scroll イベントで矢印の表示/非表示を切り替える
    // { passive: true }: ブラウザのスクロール最適化を妨げないオプション
    const handleScroll = () => {
      setArrowVisible(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // クリーンアップ: コンポーネントが消えた時にリスナーを解除してメモリリークを防ぐ
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // [] = マウント時に 1 回だけ登録

  return (
    <section
      aria-label="ファーストビュー"
      // items-end: コンテンツを画面下部に寄せ、上の空・海・景色をたっぷり見せるリゾート構図
      //   （映画ポスター的なレイアウト。items-center はコーポレート LP 寄り）
      className="relative flex min-h-[90vh] items-end sm:min-h-screen"
    >
      {/* ----- 背景画像 ----- */}
      {/*
       * fill: 親要素（relative）いっぱいに画像を広げる
       * priority: LCP 対象のため先読みを指定
       * object-cover: アスペクト比を保ちつつ全体を覆う
       * sizes: レスポンシブ幅ヒント（画像最適化に使われる）
       */}
      <Image
        src={heroImage}
        alt="TATEYAMA BASE 北条 外観"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* ----- グラデーションオーバーレイ ----- */}
      {/*
       * bg-gradient-to-t: 下から上へグラデーション
       * from-black/40: 下端は 40% の黒でテキストを読みやすくする
       *   （旧: 65% → 50% → 40% と段階的に下げて背景写真の開放感を活かす。WCAG AA 達成済み）
       * via-black/15: 中間は 15% に抑えて写真を活かす
       * to-transparent: 上端は透明にして空の青さを生かす
       * aria-hidden: スクリーンリーダーには意味のない装飾要素なので隠す
       */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent"
        aria-hidden="true"
      />

      {/* ----- コンテンツ（画像・オーバーレイより手前に表示） ----- */}
      {/*
       * pb-16 sm:pb-20: 下余白でコンテンツが画面下端に近すぎないよう確保
       * pt-0: items-end で下寄せのため上パディングは不要
       */}
      <div className="relative mx-auto w-full max-w-6xl space-y-6 px-4 pb-16 pt-0 sm:px-6 sm:pb-20">
        {/* キャッチコピー: h1 はページに 1 つ（docs/DESIGN.md 2.2 より） */}
        {/*
         * leading-snug（行間 1.375）: leading-tight（1.25）より開放的で、宿泊サイトの「ゆったり感」に合わせる
         * tracking-normal（字間 0）: tracking-tight の「詰め詰め感」をなくしてリゾート感を演出する
         */}
        {/*
         * font-mincho: Shippori Mincho（明朝体）を適用（Issue #85）
         * 和の上品さ・リゾート感を演出する。英数字への影響は最小限（latin subsets 込みで読み込み済み）
         */}
        <h1 className="font-mincho max-w-2xl text-4xl font-bold leading-snug tracking-normal text-white sm:text-5xl lg:text-6xl whitespace-pre-wrap">
          {CATCH_COPY}
        </h1>

        {/* サブコピー: text-lg に拡大して読みやすさを向上 */}
        {/*
         * text-white: 不透明度を 90% → 100% に戻してオーバーレイが薄い状態でも視認性を確保
         * [text-shadow:...]: Tailwind の任意値記法でテキストシャドウを付与
         *   写真背景サイトの定番手法。オーバーレイに頼らずにコントラストを補強できる
         */}
        <p className="max-w-xl text-lg leading-7 text-white whitespace-pre-wrap [text-shadow:0_1px_4px_rgba(0,0,0,0.70)]">
          {SUB_COPY}
        </p>

        {/* 主要 CTA: ご宿泊予約（URL 未設定時は「準備中」） */}
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

      {/* ----- スクロール促進矢印 ----- */}
      {/*
       * absolute bottom-6: セクション下端から 24px 上に配置
       * left-1/2 -translate-x-1/2: 水平方向に中央揃え
       * animate-bounce: Tailwind 組み込みのバウンスアニメーション（上下に揺れる）
       * transition-opacity duration-500: opacity 変化を 500ms でなめらかに切り替える
       * aria-hidden="true": 装飾要素なのでスクリーンリーダーには読ませない
       */}
      <div
        aria-hidden="true"
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
          arrowVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* シェブロン（∨）アイコン: SVG でシンプルに描画 */}
        <svg
          className="h-8 w-8 animate-bounce text-white drop-shadow-md"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </section>
  );
}
