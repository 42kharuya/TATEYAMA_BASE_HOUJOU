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
 *   5. ページ内ショートカット（料金・アクセス・予約）
 *
 * 画像最適化:
 *   - next/image の priority prop でファーストビューの LCP を改善する
 *     （LCP = Largest Contentful Paint: 最大要素の表示速度。SEO と UX の指標）
 *
 * 環境変数:
 *   - NEXT_PUBLIC_BOOKING_URL: 未設定時は「準備中」で CTA を無効化する
 */

import Image from "next/image";

import heroImage from "../../imgs/hero-exterior.jpg";
import { anchorHref } from "../_lib/anchors";
import { CTAButton } from "./CTAButton";

// ---- コンテンツ定数（docs/CONTENT.md の確定文言を使用） ----

/** h1 に載せるキャッチコピー */
const CATCH_COPY = "海もアクティビティも観光も、遊びのベースキャンプ。";

/** キャッチコピー直下のサブコピー */
const SUB_COPY =
  "1棟貸しの「TATEYAMA BASE 北条」。屋上テラスや1階ウッドデッキ、卓球・麻雀などの室内アクティビティも揃い、家族や仲間との滞在をアクティブに楽しめます。";

/** ページ内ショートカットリンク */
const SHORTCUTS = [
  { label: "特徴",     href: anchorHref("features") },
  { label: "料金",     href: anchorHref("pricing") },
  { label: "アクセス", href: anchorHref("access") },
  { label: "予約",     href: anchorHref("booking") },
] as const;

export function Hero() {
  // NEXT_PUBLIC_BOOKING_URL が未設定の場合は undefined になる
  // → CTAButton に渡すと「準備中」フォールバックが動く
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return (
    <section
      aria-label="ファーストビュー"
      className="relative flex min-h-[90vh] items-center sm:min-h-screen"
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
       * from-black/65: 下端は 65% の黒でテキストを読みやすくする
       * via-black/25: 中間は 25% に抑えて写真を活かす
       * to-transparent: 上端は透明にして空の青さを生かす
       * aria-hidden: スクリーンリーダーには意味のない装飾要素なので隠す
       */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
        aria-hidden="true"
      />

      {/* ----- コンテンツ（画像・オーバーレイより手前に表示） ----- */}
      <div className="relative mx-auto w-full max-w-6xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
        {/* キャッチコピー: h1 はページに 1 つ（docs/DESIGN.md 2.2 より） */}
        {/*
         * leading-snug（行間 1.375）: leading-tight（1.25）より開放的で、宿泊サイトの「ゆったり感」に合わせる
         * tracking-normal（字間 0）: tracking-tight の「詰め詰め感」をなくしてリゾート感を演出する
         */}
        <h1 className="max-w-2xl text-4xl font-bold leading-snug tracking-normal text-white sm:text-5xl lg:text-6xl">
          {CATCH_COPY}
        </h1>

        {/* サブコピー: text-lg に拡大して読みやすさを向上 */}
        <p className="max-w-xl text-lg leading-7 text-white/90">{SUB_COPY}</p>

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

        {/* ページ内ショートカット: ピル形状バッジで視認性・タップ領域を改善 */}
        {/*
         * rounded-full: 角丸にしてバッジ/ピル形状にする
         * border border-white/40: 薄い白枠で存在感を出す
         * bg-white/10: 半透明の白背景（glass morphism 風）
         * backdrop-blur-sm: 背景を少しぼかしてグラスエフェクトを演出
         */}
        <nav aria-label="ページ内ショートカット">
          <ul className="flex flex-wrap gap-2">
            {SHORTCUTS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
