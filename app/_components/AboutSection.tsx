/**
 * AboutSection — 施設概要セクション（Hero 直下）
 *
 * 目的: 施設「TATEYAMA BASE 北条」の全体像を写真とテキストで伝える。
 *       SummarySection（基本情報）を廃止し、写真付きのエディトリアルスタイルに刷新。
 *
 * レイアウト:
 *   - スマホ: 写真上 + テキスト下（縦積み）
 *   - PC (md〜): 写真左・テキスト右の2カラム
 *
 * 掲載情報（docs/FACTS.md の確定情報のみ）:
 *   - 1棟貸し、4〜8名
 *   - 海まで徒歩約2分
 *   - 館山駅から徒歩約9分
 *   - 屋上テラス・1階ウッドデッキ
 *   - 卓球・麻雀等の室内アクティビティ
 *   - レンタル用品（SUP・ウェットスーツ等）
 */

import Image from "next/image";
import coastImg from "../../imgs/houjou-coast-scenery.jpg";

// ---- 概要テキスト: 3段落に分けて読みやすく ----
const PARAGRAPHS = [
  "千葉県館山市・北条海岸そばの1棟貸し貸別荘。",
  "海まで徒歩約2分。砂浜へのアクセスがよく、海風を感じながらグループや家族だけの時間を過ごせます。",
  "1棟を丸ごと独占でき、周りを気にせず自分たちのペースでくつろげます。",
];

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* ── タイトル（全幅・中央） ───────────────────────────
         * セクション上部に大きく据えて存在感を出す
         * mb-10 sm:mb-14: タイトルと下コンテンツの間に余白
         */}
        <h2
          id="about-heading"
          className="font-mincho mb-10 text-center text-3xl font-bold tracking-widest text-stone-900 sm:mb-14 sm:text-4xl"
        >
          TATEYAMA BASE 北条
        </h2>

        {/* ── 写真 + テキストの2カラム ─────────────────────────
         * スマホ: 縦積み（写真上・テキスト下）
         * sm〜: 写真左(3/5) + テキスト右(2/5)
         */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">

          {/* 写真 */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:w-2/3">
            <Image
              src={coastImg}
              alt="館山・北条海岸の風景"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 67vw, 100vw"
            />
          </div>

          {/* テキスト */}
          <div className="flex flex-col gap-4 sm:w-1/3">
            {PARAGRAPHS.map((text, i) => (
              <p key={i} className="text-base leading-7 text-stone-600">
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
