/**
 * PricingTableToggle — 料金表トグルコンポーネント
 *
 * 役割: 「料金表を見る」ボタンで詳細料金表を開閉する。
 *       PricingSection はサーバーコンポーネントのままにするため、
 *       インタラクション（useState）はこのファイルに分離する。
 *
 * "use client" ディレクティブ:
 *   Next.js では useState / useEffect などのブラウザ機能を使うコンポーネントに
 *   先頭でこれを宣言する必要がある。宣言したコンポーネントはクライアントで実行される。
 */
"use client";

import { useState } from "react";

import { PRICING_ROWS, SEASONS, yen } from "../_lib/pricingData";

export function PricingTableToggle() {
  /**
   * isOpen: 料金表が開いているか閉じているかの状態
   * useState(false): 初期値は「閉じた状態」
   * setIsOpen: 状態を更新する関数（呼ぶたびに再レンダリングされる）
   */
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* ── トグルボタン ── */}
      {/*
       * ボタンをクリックするたびに isOpen を反転させる（true ↔ false）
       * aria-expanded: スクリーンリーダー向けに「展開中か否か」を伝えるアクセシビリティ属性
       * aria-controls: このボタンが操作するコンテンツの id を指定する
       */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="pricing-table-content"
        className="flex w-full items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
      >
        <span>{isOpen ? "料金表を閉じる" : "料金表を見る"}</span>
        {/*
         * 矢印アイコン（SVG）
         * transition-transform: アイコン回転アニメーションを有効にする
         * rotate-180: isOpen のとき上向き矢印になるよう180度回転させる
         */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/*
       * ── 料金表コンテンツ（開閉エリア） ──
       *
       * isOpen が false のときは hidden クラスで DOM から視覚的に隠す。
       * hidden: display:none 相当。スクリーンリーダーにも非表示として伝わる。
       */}
      <div
        id="pricing-table-content"
        className={`mt-3 space-y-3 ${isOpen ? "" : "hidden"}`}
      >
        {/*
         * ── モバイル専用カードビュー（sm 未満で表示） ──
         *
         * sm:hidden: スマホでのみ表示し、タブレット以上では非表示にする
         */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {PRICING_ROWS.map((row) => (
            /*
             * 人数カード 1枚
             * rounded-xl + border: シーズン定義カードと同じ見た目に揃える
             */
            <div
              key={row.guests}
              className="rounded-xl border border-stone-200 p-4 dark:border-zinc-700"
            >
              {/* カードヘッダー: 人数と使用フロア */}
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-base font-semibold text-stone-900 dark:text-zinc-50">
                  {row.guests}名
                </span>
                <span className="text-xs text-stone-500 dark:text-zinc-400">
                  ({row.note})
                </span>
              </div>

              {/* シーズン別料金を縦列表示 */}
              <div className="space-y-2">
                {SEASONS.map((s) => (
                  /*
                   * 1行 = 1シーズン
                   * justify-between: バッジを左端・料金を右端に配置
                   */
                  <div
                    key={s.key}
                    className="flex items-center justify-between gap-2"
                  >
                    {/* シーズンバッジ: SEASONS の badgeColor をそのまま流用 */}
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.badgeColor}`}
                    >
                      {s.label}
                    </span>
                    {/* 料金: tabular-nums で数字幅を揃えて縦に整列させる */}
                    <span className="tabular-nums text-sm font-medium text-stone-900 dark:text-zinc-50">
                      {yen(row.prices[s.key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/*
         * ── PC・タブレット向けテーブルビュー（sm 以上で表示） ──
         *
         * hidden sm:block: sm 未満では非表示にし、sm 以上でのみ表示する
         * overflow-x-auto: 万が一の横はみ出しをスクロールで吸収する
         */}
        <div className="hidden sm:block">
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
                      className="px-3 py-3 text-right font-semibold"
                    >
                      {/* テーブルヘッダーにもシーズンの色を付けてカードと対応させる */}
                      <span className={s.labelColor}>{s.label}</span>
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
        </div>
      </div>
    </div>
  );
}
