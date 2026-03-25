/**
 * pricingData — 料金データの共有モジュール
 *
 * 役割: PricingSection（表示）と PriceSimulator（インタラクティブ計算）の
 *       両方が参照する料金データを一元管理する。
 *
 * データ根拠: docs/FACTS.md（確定情報のみ）
 *
 * ※ レンタル料金（RENTAL_ITEMS）は画像ファイルの import を伴うため
 *    PricingSection.tsx 側で引き続き管理する。
 */

import type { SeasonKey } from "./seasonDetector";

// ─────────────────────────────────────────────
// 宿泊料金テーブル
// ─────────────────────────────────────────────

/** 1行分の宿泊人数データ */
export type PriceRow = {
  /** 宿泊人数 */
  guests: number;
  /** 使用フロアの補足（例: "1階のみ"） */
  note: string;
  /**
   * シーズン別の料金（円）・清掃費込み
   * offseason: オフシーズン
   * regular:   レギュラーシーズン
   * high:      ハイシーズン
   * top:       トップシーズン
   */
  prices: Record<SeasonKey, number>;
};

/**
 * 宿泊料金テーブル（清掃費込み）
 * ※ 計算式（base + extra × count）だと端数が合わないため絶対値で管理
 */
export const PRICING_ROWS: PriceRow[] = [
  {
    guests: 4,
    note: "1階のみ",
    prices: { offseason: 46000, regular: 53000, high: 58000, top: 63000 },
  },
  {
    guests: 5,
    note: "1・2階",
    prices: { offseason: 48500, regular: 56500, high: 61500, top: 66500 },
  },
  {
    guests: 6,
    note: "1・2階",
    prices: { offseason: 51000, regular: 60000, high: 65000, top: 70000 },
  },
  {
    guests: 7,
    note: "1・2階",
    prices: { offseason: 53500, regular: 63500, high: 68500, top: 73500 },
  },
  {
    guests: 8,
    note: "1・2階",
    prices: { offseason: 56000, regular: 67000, high: 72000, top: 77000 },
  },
];

// ─────────────────────────────────────────────
// シーズン定義（ラベル・説明・カラー）
// ─────────────────────────────────────────────

/** シーズン定義の1エントリ */
export type SeasonConfig = {
  key: SeasonKey;
  /** 表示ラベル（例: "ハイ"） */
  label: string;
  /** 期間の説明（シーズンカードに表示） */
  description: string;
  /**
   * シーズンカードのバッジに使う Tailwind クラス
   * bg/text/border を light と dark 両対応で指定する
   */
  badgeColor: string;
  /**
   * 料金テーブルヘッダーのテキスト色
   * バッジと同じシーズンカラーを共有する
   */
  labelColor: string;
};

/**
 * シーズン定義リスト（オフ → レギュラー → ハイ → トップの昇順）
 * 順序は料金テーブルの列順として使用する
 */
export const SEASONS: SeasonConfig[] = [
  {
    key: "offseason",
    label: "オフシーズン",
    description: "左記以外",
    badgeColor:
      "bg-stone-100 text-stone-600 border-stone-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    labelColor: "text-stone-600 dark:text-zinc-400",
  },
  {
    key: "regular",
    label: "レギュラー",
    description: "日祝・春休み（土曜・祝前日・3連休2日目・7〜9月除く）",
    badgeColor:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800",
    labelColor: "text-sky-700 dark:text-sky-400",
  },
  {
    key: "high",
    label: "ハイ",
    description: "土曜・祝前日・3連休2日目・7/10〜9/10（お盆除く）",
    badgeColor:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    labelColor: "text-amber-700 dark:text-amber-400",
  },
  {
    key: "top",
    label: "トップ",
    description: "GW・お盆・シルバーウィーク・年末年始（12/28〜1/7）は都度設定",
    badgeColor:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    labelColor: "text-red-700 dark:text-red-400",
  },
];

// ─────────────────────────────────────────────
// ユーティリティ
// ─────────────────────────────────────────────

/** 数値を円表示にフォーマットする（例: 46000 → "¥46,000"） */
export function yen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}
