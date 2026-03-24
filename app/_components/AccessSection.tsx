/**
 * AccessSection — アクセスセクション
 *
 * 役割: 住所・地図リンク・交通手段を表示し、初めて訪れるユーザーの不安を取り除く。
 *
 * 構成:
 *   1. 住所（郵便番号+住所）
 *   2. 地図 CTA（Googleマップ）
 *      - NEXT_PUBLIC_MAP_URL 未設定時は「準備中」で無効化
 *   3. 最寄り情報（駅・海）
 *   4. 交通手段
 *
 * データの根拠: docs/FACTS.md（確定情報のみ）
 * 環境変数: NEXT_PUBLIC_MAP_URL（未設定時は地図 CTA が「準備中」）
 */

import { ANCHOR_IDS } from "../_lib/anchors";
import { SITE } from "../_lib/site";
import { CTAButton } from "./CTAButton";
import { Section } from "./Section";

// ---- 確定情報（docs/FACTS.md より） ----

/** 最寄り情報（数値は一次情報に基づき「約」を付ける） */
const NEARBY = [
  { label: "海（北条海岸）", detail: "徒歩約30秒" },
  { label: "館山駅", detail: "徒歩約9分" },
];

/** 交通手段（確定済み） */
const TRANSPORT_OPTIONS = ["車", "電車", "バス", "高速ジェット", "フェリー"];

export function AccessSection() {
  return (
    // id="access" を設定して、ヘッダーや他セクションの「アクセス」リンクから到達できるようにする
    // variant="tinted": 最後に柔らかくまとめるオフホワイト帯（Issue #25）
    <Section
      id={ANCHOR_IDS.access}
      title="アクセス"
      lead="館山駅から徒歩圈内。海まで徐歩絀30秒の好立地です。"
      variant="tinted"
    >
      {/* ---- 住所 + 地図 CTA ---- */}
      <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-100 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        {/* 住所 */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            住所
          </p>
          <p className="mt-1 text-base font-medium text-stone-900 dark:text-zinc-50">
            {SITE.address}
          </p>
        </div>

        {/*
         * 地図 CTA
         * CTAButton に SITE.mapUrl を渡す。
         * undefined（NEXT_PUBLIC_MAP_URL 未設定）の場合は CTAButton が自動で「準備中」に切り替える。
         * variant="tertiary": 地図リンクは補助的な行動（テキストリンク風）
         */}
        <CTAButton
          variant="tertiary"
          href={SITE.mapUrl}
          external
          description={!SITE.mapUrl ? "地図リンクは準備中です。" : undefined}
        >
          Googleマップで開く
        </CTAButton>
      </div>

      {/* ---- 最寄り情報 ---- */}
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
          最寄り
        </h3>
        {/* dl（definition list）: 名称と補足をペアで表現するセマンティックな要素 */}
        <dl className="mt-3 space-y-2">
          {NEARBY.map((item) => (
            <div key={item.label} className="flex items-baseline gap-3">
              <dt className="w-28 shrink-0 text-sm font-medium text-stone-900 dark:text-zinc-50">
                {item.label}
              </dt>
              <dd className="text-sm text-stone-600 dark:text-zinc-400">
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---- 交通手段 ---- */}
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
          交通手段
        </h3>
        {/* flex-wrap: 要素数が多い場合に自動で折り返す */}
        <div className="mt-3 flex flex-wrap gap-2">
          {TRANSPORT_OPTIONS.map((option) => (
            <span
              key={option}
              className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              {option}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
