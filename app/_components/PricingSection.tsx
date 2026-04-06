/**
 * PricingSection — 料金セクション
 *
 * 役割: シーズン別・人数別の宿泊料金、キャンセルポリシー、レンタル料金を表示する。
 *
 * 構成:
 *   1. 料金シミュレーター（日付＋人数 → シーズン自動判定 → 料金表示）
 *   2. シーズン定義カード（料金表前に期間を先出し）
 *   3. 詳細料金表（シーズン × 宿泊人数）
 *   4. キャンセルポリシー
 *   5. レンタル料金
 *
 * データの根拠: docs/FACTS.md（確定情報のみ）
 * 料金データ: app/_lib/pricingData.ts（PriceSimulator と共有）
 */

import Image, { StaticImageData } from "next/image";

import sapImg from "../../imgs/rental-sup.jpg";
import wetSuitImg from "../../imgs/rental-wet-suit.jpg";
import lifeJacketImg from "../../imgs/rental-life-jacket.jpg";
import { ANCHOR_IDS } from "../_lib/anchors";
import { SEASONS, yen } from "../_lib/pricingData";
import { PriceSimulator } from "./PriceSimulator";
import { PricingTableToggle } from "./PricingTableToggle";
import { SeasonCalendar } from "./SeasonCalendar";
import { Section } from "./Section";

// PRICING_ROWS, SEASONS は app/_lib/pricingData.ts で一元管理
// PriceSimulator（クライアントコンポーネント）が共有するため lib 側に移動済み

/** キャンセルポリシー */
const CANCELLATION_RULES = [
  { timing: "7日〜3日前", rate: "ご利用料の30%" },
  { timing: "2日〜1日前", rate: "ご利用料の50%" },
  { timing: "当日", rate: "ご利用料の100%" },
];

/**
 * レンタル料金（写真付き）
 * image: next/image で読み込む静的画像（StaticImageData）
 *        ← 画像 import が必要なためこのファイルで管理（pricingData.ts には入れない）
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

// yen 関数は app/_lib/pricingData.ts からインポート済み

export function PricingSection() {
  return (
    // id="pricing" を設定して、ヘッダーや他セクションの「料金」リンクから到達できるようにする
    <Section
      id={ANCHOR_IDS.pricing}
      title="料金"
      lead="清掃費込み。宿泊人数とシーズンによって料金が変わります。"
    >
      {/* ---- 1. 料金シミュレーター ---- */}
      {/*
       * PriceSimulator は「use client」のクライアントコンポーネント。
       * ユーザーが日付と人数を選ぶとシーズン判定 → 料金をその場で表示する。
       */}
      <PriceSimulator />

      {/* ---- 2. シーズン定義カード ---- */}
      {/*
       * テーブルより先にシーズン期間を見せることで「自分はいつ泊まるのか」を
       * 確認してから料金表を読む自然な流れを作る。
       * grid-cols-2 sm:grid-cols-4: モバイルは2列、PCは4列で並べる
       */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SEASONS.map((s) => (
          <div
            key={s.key}
            className="rounded-xl border border-stone-200 p-4 dark:border-zinc-700"
          >
            {/* カラーバッジ: シーズンを色で直感的に区別する */}
            <span
              className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.badgeColor}`}
            >
              {s.label}
            </span>
            {/* 期間説明: 自分がどのシーズンに当たるか確認できる */}
            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-zinc-400">
              {s.description}
            </p>
          </div>
        ))}
      </div>

      {/*
       * 月カレンダービジュアル: 1〜12月をシーズン色で色分け表示する。
       * SeasonCalendar は "use client" のクライアントコンポーネント。
       * 現在月の強調表示を行うためのみ分離している。
       */}
      <SeasonCalendar />

      {/* ---- 3. 詳細料金表 ---- */}
      {/*
       * PricingTableToggle: 「料金表を見る」ボタンで開閉できるクライアントコンポーネント
       * useState を使うため別ファイルに分離し、このファイルをサーバーコンポーネントのまま維持する
       */}
      <PricingTableToggle />

      {/* ---- 4. キャンセルポリシー ---- */}
      <div className="rounded-xl border border-stone-200 p-5 dark:border-zinc-700">
        {/* headingLevel=3: Section の h2 "料金" の下に位置する小見出し */}
        <h3 className="mb-4 text-base font-semibold text-stone-900 dark:text-zinc-50">
          キャンセルポリシー
        </h3>
        {/* overflow-hidden + rounded-lg: テーブルの角を丸く保ちつつヘッダー背景をはみ出させない */}
        <div className="overflow-hidden rounded-lg border border-stone-100 dark:border-zinc-700">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <thead>
              {/* ヘッダー行: 背景色を付けてデータ行と区別する */}
              <tr className="bg-stone-50 dark:bg-zinc-800/80">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-400">
                  キャンセル時期
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-400">
                  キャンセル料
                </th>
              </tr>
            </thead>
            {/* divide-y: tbody の各行の間に区切り線を自動挿入する */}
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {CANCELLATION_RULES.map((rule) => (
                <tr
                  key={rule.timing}
                  className="transition-colors hover:bg-stone-50 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 text-stone-700 dark:text-zinc-300">
                    {rule.timing}
                  </td>
                  {/* キャンセル料はやや強調して右揃えに */}
                  <td className="px-4 py-3 text-right font-semibold text-stone-900 dark:text-zinc-50">
                    {rule.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- 5. レンタル料金 ---- */}
      <div className="rounded-xl border border-stone-200 p-5 dark:border-zinc-700">
        <h3 className="mb-4 text-base font-semibold text-stone-900 dark:text-zinc-50">
          レンタル料金
        </h3>
        <div className="space-y-4">
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

        {/*
         * 破損・紛失時弁償注釈
         * role="note": スクリーンリーダーに「補足情報」であることを伝えるセマンティクス
         * キャンセルポリシーと同様に、目立ちすぎず確実に読める小文字スタイルで配置する
         */}
        <p
          role="note"
          className="mt-4 text-xs leading-relaxed text-stone-500 dark:text-zinc-400"
        >
          ※ SAP・ウェットスーツ・ライフジャケットをご使用の際、破損・紛失等が生じた場合は、有償にて弁償していただきます。
        </p>
      </div>
    </Section>
  );
}
