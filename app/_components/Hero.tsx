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
 *   ※ ページ内ナビは Header（スクロール追従）に委ねる
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
import { CTAButton } from "./CTAButton";

// ---- コンテンツ定数（docs/CONTENT.md の確定文言を使用） ----

/** h1 に載せるキャッチコピー */
const CATCH_COPY = "海もアクティビティも観光も、遊びのベースキャンプ。";

/** キャッチコピー直下のサブコピー */
const SUB_COPY =
  "1棟貸しの「TATEYAMA BASE 北条」。屋上テラスや1階ウッドデッキ、卓球・麻雀などの室内アクティビティも揃い、家族や仲間との滞在をアクティブに楽しめます。";

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
        {/*
         * text-white: 不透明度を 90% → 100% に戻してオーバーレイが薄い状態でも視認性を確保
         * [text-shadow:...]: Tailwind の任意値記法でテキストシャドウを付与
         *   写真背景サイトの定番手法。オーバーレイに頼らずにコントラストを補強できる
         */}
        <p className="max-w-xl text-lg leading-7 text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.70)]">
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
    </section>
  );
}
