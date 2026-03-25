/**
 * PricingSection — 料金セクション
 *
 * 役割: シーズン別・人数別の宿泊料金、キャンセルポリシー、レンタル料金を表示する。
 *
 * 構成:
 *   1. 料金サマリー（最安値・前提を一目で把握）＋「料金を見る」アンカー導線
 *   2. 詳細料金表（シーズン × 宿泊人数）
 *   3. キャンセルポリシー
 *   4. レンタル料金
 *
 * データの根拠: docs/FACTS.md（確定情報のみ）
 */

import Image, { StaticImageData } from "next/image";

import sapImg from "../../imgs/sap.jpg";
import wetSuitImg from "../../imgs/wet-suit.jpg";
import lifeJacketImg from "../../imgs/life-jacket.jpg";
import { ANCHOR_IDS } from "../_lib/anchors";
import { Section } from "./Section";

// ---- 料金データ（docs/FACTS.md の確定値をそのまま使用） ----
// ※ 計算式（base + extra × count）だと端数が合わないため、絶対値で管理する

/** 1 行分の宿泊人数データ */
type PriceRow = {
  /** 宿泊人数 */
  guests: number;
  /** 使用フロアの補足 */
  note: string;
  /**
   * シーズン別の料金（円）
   * offseason: オフシーズン
   * regular:   レギュラーシーズン
   * high:      ハイシーズン
   * top:       トップシーズン
   */
  prices: {
    offseason: number;
    regular: number;
    high: number;
    top: number;
  };
};

/** 宿泊料金テーブル（清掃費込み） */
const PRICING_ROWS: PriceRow[] = [
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

/** シーズン定義（列ヘッダーと期間説明） */
const SEASONS = [
  { key: "offseason" as const, label: "オフシーズン", description: "左記以外" },
  {
    key: "regular" as const,
    label: "レギュラー",
    description: "日祝・春休み（土曜・祝前日・3連休2日目・7〜9月除く）",
  },
  {
    key: "high" as const,
    label: "ハイ",
    description: "土曜・祝前日・3連休2日目・7/10〜9/10（お盆除く）",
  },
  {
    key: "top" as const,
    label: "トップ",
    description: "GW・お盆・シルバーウィーク・年末年始（12/28〜1/7）は都度設定",
  },
];

/** キャンセルポリシー */
const CANCELLATION_RULES = [
  { timing: "7日〜3日前", rate: "ご利用料の30%" },
  { timing: "2日〜1日前", rate: "ご利用料の50%" },
  { timing: "当日", rate: "ご利用料の100%" },
];

/**
 * レンタル料金（写真付き）
 * image: next/image で読み込む静的画像（StaticImageData）
 * alt:   スクリーンリーダー向けの代替テキスト
 */
type RentalItem = {
  name: string;
  note?: string;
  image?: StaticImageData;
  alt?: string;
  rows: { label: string; price: number }[];
};

/** レンタル料金 */
const RENTAL_ITEMS: RentalItem[] = [
  {
    name: "サップ（ウェットスーツ＋ライフジャケット付き・2人乗り）",
    note: "重量 100 ㎏ まで / 1日",
    image: sapImg,
    alt: "SUP（スタンドアップパドルボード）",
    rows: [
      { label: "1台", price: 3000 },
      { label: "2台", price: 5000 },
      { label: "3台", price: 7000 },
      { label: "4台", price: 9000 },
    ],
  },
  {
    name: "ウェットスーツのみ",
    image: wetSuitImg,
    alt: "ウェットスーツ",
    rows: [{ label: "1着", price: 1000 }],
  },
  {
    name: "ライフジャケットのみ",
    image: lifeJacketImg,
    alt: "ライフジャケット",
    rows: [{ label: "1着", price: 1000 }],
  },
];

/** 数値を円表示にフォーマットする（例: 46000 → "¥46,000"） */
function yen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function PricingSection() {
  return (
    // id="pricing" を設定して、ヘッダーや他セクションの「料金」リンクから到達できるようにする
    <Section
      id={ANCHOR_IDS.pricing}
      title="料金"
      lead="清掃費込み。宿泊人数とシーズンによって料金が変わります。"
    >
      {/* ---- 1. 料金サマリー ---- */}
      {/* ページ上部から「料金を見る → #pricing」で到達した際に最短で要点を把握できるようにする */}
      <div className="rounded-xl border border-stone-200 bg-stone-100 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
          料金はじめに
        </p>

        {/*
         * Issue #26: アンカー価格（最安値）を大きく打ち出す
         * text-4xl font-bold tabular-nums: 数値を大きく・桁揃えで表示
         * text-sky-700: ブランドカラーで視線を誘導する
         */}
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums text-sky-700 dark:text-sky-400">
            ¥46,000〜
          </span>
          <span className="text-sm text-stone-500 dark:text-zinc-400">清掃費込み</span>
        </div>

        <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700 dark:text-zinc-300">
          <li>
            <span className="font-medium">最安：オフシーズン 4名まで</span>
          </li>
          <li>
            <span className="font-medium">宿泊人数：</span>4〜8名
          </li>
          <li>
            <span className="font-medium">シーズン区分：</span>
            オフ / レギュラー / ハイ / トップ（4段階）
          </li>
          <li>
            <span className="font-medium">トップシーズン：</span>
            GW・お盆・シルバーウィーク・年末年始は都度設定
          </li>
        </ul>
        <p className="mt-3 text-xs text-stone-500 dark:text-zinc-400">
          ※ 詳細は下記の料金表をご確認ください。
        </p>
      </div>

      {/* ---- 2. 詳細料金表 ---- */}
      {/* overflow-x-auto: スマホでも横スクロールで表全体を確認できる */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-zinc-700">
              {/* 人数列 */}
              <th className="py-3 pr-4 text-left font-semibold text-stone-900 dark:text-zinc-50">
                人数
              </th>
              {/* シーズン列（4列） */}
              {SEASONS.map((s) => (
                <th
                  key={s.key}
                  className="px-3 py-3 text-right font-semibold text-stone-900 dark:text-zinc-50"
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICING_ROWS.map((row) => (
              <tr
                key={row.guests}
                className="border-b border-stone-100 last:border-0 dark:border-zinc-800"
              >
                {/* 人数 + 使用フロア注記 */}
                <td className="py-3 pr-4 text-stone-900 dark:text-zinc-50">
                  <span className="font-medium">{row.guests}名</span>
                  <span className="ml-1.5 text-xs text-stone-500 dark:text-zinc-400">
                    ({row.note})
                  </span>
                </td>
                {/* シーズン別料金 */}
                {SEASONS.map((s) => (
                  <td
                    key={s.key}
                    className="px-3 py-3 text-right tabular-nums text-stone-700 dark:text-zinc-300"
                  >
                    {yen(row.prices[s.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* シーズン定義の補足 */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400">
          シーズン区分の目安
        </p>
        <ul className="space-y-1">
          {SEASONS.map((s) => (
            <li
              key={s.key}
              className="text-xs leading-5 text-stone-500 dark:text-zinc-400"
            >
              <span className="font-medium text-stone-700 dark:text-zinc-300">
                {s.label}：
              </span>
              {s.description}
            </li>
          ))}
        </ul>
      </div>

      {/* ---- 3. キャンセルポリシー ---- */}
      <div>
        {/* headingLevel=3: Section の h2 "料金" の下に位置する小見出し */}
        <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
          キャンセルポリシー
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-zinc-700">
                <th className="py-2 pr-4 text-left font-semibold text-stone-900 dark:text-zinc-50">
                  キャンセル時期
                </th>
                <th className="py-2 text-right font-semibold text-stone-900 dark:text-zinc-50">
                  キャンセル料
                </th>
              </tr>
            </thead>
            <tbody>
              {CANCELLATION_RULES.map((rule) => (
                <tr
                  key={rule.timing}
                  className="border-b border-stone-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="py-2 pr-4 text-stone-700 dark:text-zinc-300">
                    {rule.timing}
                  </td>
                  <td className="py-2 text-right text-stone-700 dark:text-zinc-300">
                    {rule.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- 4. レンタル料金 ---- */}
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
          レンタル料金
        </h3>
        <div className="mt-4 space-y-4">
          {RENTAL_ITEMS.map((item) => (
            /*
             * 各レンタル品カード
             * flex-col（モバイル）/ sm:flex-row（PC）: 縦積み→横並びのレスポンシブ切替
             * overflow-hidden: 角丸から写真がはみ出さないよう制御
             */
            <div
              key={item.name}
              className="flex flex-col overflow-hidden rounded-xl border border-stone-200 dark:border-zinc-700 sm:flex-row"
            >
              {/* 写真エリア（画像がある場合のみ表示） */}
              {item.image ? (
                <div
                  className="
                    relative w-full shrink-0
                    aspect-[4/3]
                    sm:aspect-auto sm:w-40
                  "
                >
                  {/*
                   * next/image の fill: 親要素のサイズに合わせて画像を拡大縮小
                   * object-cover: アスペクト比を保ちながらはみ出た部分をトリミング
                   * sizes: ビューポート幅に応じた読み込み解像度を指定してデータ量を最適化
                   */}
                  <Image
                    src={item.image}
                    alt={item.alt ?? item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 160px"
                  />
                </div>
              ) : null}

              {/* テキスト・料金エリア */}
              <div className="flex flex-1 flex-col justify-center p-4">
                <p className="text-sm font-medium text-stone-900 dark:text-zinc-50">
                  {item.name}
                </p>
                {item.note ? (
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
                    {item.note}
                  </p>
                ) : null}

                {/* 料金行（台数 / 着数 × 金額） */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.rows.map((r) => (
                    <div
                      key={r.label}
                      className="rounded-md border border-stone-200 px-3 py-1.5 text-sm dark:border-zinc-700"
                    >
                      <span className="text-stone-500 dark:text-zinc-400">
                        {r.label} :{" "}
                      </span>
                      <span className="font-medium tabular-nums text-stone-900 dark:text-zinc-50">
                        {yen(r.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
