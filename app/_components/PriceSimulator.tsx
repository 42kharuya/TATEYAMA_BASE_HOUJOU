/**
 * PriceSimulator — 料金シミュレーター
 *
 * 役割: 宿泊日と宿泊人数を選ぶと、シーズンを自動判定して料金を即時表示する
 *       インタラクティブなウィジェット。
 *
 * 技術:
 *   - "use client": ユーザー操作（日付選択・人数選択）に useState で反応するため
 *   - <input type="date">: ネイティブの日付ピッカー（外部ライブラリなし）
 *   - detectSeason: app/_lib/seasonDetector.ts の判定ロジックを使用
 *   - PRICING_ROWS / SEASONS: app/_lib/pricingData.ts の共有データを使用
 *
 * 注意:
 *   - トップシーズン（GW・お盆等）は「都度設定」のため、参考料金として表示する
 *   - 祝日データは 2025〜2027 年分のみ精度が保証される
 */

"use client";

import { useState } from "react";

import { PRICING_ROWS, SEASONS, yen } from "../_lib/pricingData";
import { detectSeason } from "../_lib/seasonDetector";

/** シミュレーターが保持する状態 */
type SimulatorState = {
  /** 選択した宿泊日（"YYYY-MM-DD" 形式 or 空文字） */
  dateStr: string;
  /** 選択した宿泊人数（null = 未選択） */
  guests: number | null;
};

export function PriceSimulator() {
  // ── 状態管理 ──────────────────────────────────────
  const [state, setState] = useState<SimulatorState>({
    dateStr: "",
    guests: null,
  });

  // ── 計算ロジック ───────────────────────────────────

  /**
   * 選択状態から結果を導く
   * dateStr と guests が両方入力されたときだけ計算する
   */
  const result = (() => {
    if (!state.dateStr || state.guests === null) return null;

    // "YYYY-MM-DD" → Date に変換
    // ※ new Date("YYYY-MM-DD") は UTC 解釈になるため、
    //    タイムゾーンずれを防ぐために分割してローカル日付として構築する
    const [y, m, d] = state.dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d); // 月は 0 始まり

    const seasonKey = detectSeason(date);
    const row = PRICING_ROWS.find((r) => r.guests === state.guests);
    const seasonConfig = SEASONS.find((s) => s.key === seasonKey)!;

    if (!row) return null;

    return {
      seasonConfig,
      price: row.prices[seasonKey],
      isTop: seasonKey === "top",
    };
  })();

  // ── イベントハンドラー ─────────────────────────────

  /** 日付が変更されたときに状態を更新する */
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setState((prev) => ({ ...prev, dateStr: e.target.value }));
  }

  /** 人数ボタンが押されたときに状態を更新する */
  function handleGuestsSelect(guests: number) {
    setState((prev) => ({ ...prev, guests }));
  }

  // ── レンダリング ───────────────────────────────────

  return (
    /*
     * シミュレーターカード全体
     * rounded-2xl border: 料金テーブルと視覚的に区別できるよう外枠を強調
     * bg-stone-50: 通常の白背景より少し落ち着いたトーンで「入力エリア感」を出す
     */
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-zinc-700 dark:bg-zinc-900/60">
      {/* カードヘッダー */}
      <p className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
        料金シミュレーター
      </p>
      <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
        宿泊日と人数を選ぶと、概算料金をその場で確認できます。
      </p>

      {/* ── 入力エリア ── */}
      <div className="mt-4 space-y-4">
        {/* 日付ピッカー */}
        <div>
          <label
            htmlFor="sim-date"
            className="block text-sm font-medium text-stone-700 dark:text-zinc-300"
          >
            宿泊日
          </label>
          {/*
           * input[type="date"]: ブラウザネイティブのカレンダーを使う
           * min/max: 祝日データの対応年（2025〜2027年）に絞る
           */}
          <input
            id="sim-date"
            type="date"
            min="2025-01-01"
            max="2027-12-31"
            value={state.dateStr}
            onChange={handleDateChange}
            className="
              mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2
              text-sm text-stone-900
              focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50
              dark:focus:border-sky-400 dark:focus:ring-sky-400
            "
          />
        </div>

        {/* 宿泊人数ボタン */}
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">
            宿泊人数
          </p>
          {/*
           * 4〜8名を横並びボタンで選択する
           * 選択中ボタンは bg-sky-700 で強調表示
           */}
          <div className="mt-1 flex gap-2">
            {PRICING_ROWS.map((row) => {
              const isSelected = state.guests === row.guests;
              return (
                <button
                  key={row.guests}
                  type="button"
                  onClick={() => handleGuestsSelect(row.guests)}
                  aria-pressed={isSelected}
                  className={`
                    flex-1 rounded-lg border py-2 text-sm font-medium transition-colors
                    ${
                      isSelected
                        ? "border-sky-600 bg-sky-700 text-white dark:border-sky-500 dark:bg-sky-600"
                        : "border-stone-200 bg-white text-stone-700 hover:border-sky-300 hover:bg-sky-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-sky-500 dark:hover:bg-sky-950"
                    }
                  `}
                >
                  {row.guests}名
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 結果エリア ── */}
      <div className="mt-5 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        {result === null ? (
          /* 未選択状態のプレースホルダー */
          <p className="text-center text-sm text-stone-400 dark:text-zinc-500">
            宿泊日と人数を選ぶと料金が表示されます
          </p>
        ) : (
          /* 結果表示 */
          <div className="space-y-2">
            {/* シーズンバッジ: 判定されたシーズンを色付きで表示 */}
            <span
              className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${result.seasonConfig.badgeColor}`}
            >
              {result.seasonConfig.label}シーズン
            </span>

            {/* 料金（大きく表示） */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-stone-900 dark:text-zinc-50">
                {yen(result.price)}
              </span>
              <span className="text-sm text-stone-500 dark:text-zinc-400">
                清掃費込み / 1泊
              </span>
            </div>

            {/* 人数・シーズン期間の補足 */}
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              {state.guests}名（
              {PRICING_ROWS.find((r) => r.guests === state.guests)?.note}
              ）・{result.seasonConfig.description}
            </p>

            {/* トップシーズンの注意書き */}
            {result.isTop && (
              <p className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700 dark:bg-red-950 dark:text-red-300">
                ※ GW・お盆・シルバーウィーク・年末年始は都度設定になる場合があります。
                上記は参考料金です。詳細はお問い合わせください。
              </p>
            )}
          </div>
        )}
      </div>

      {/* 注記 */}
      <p className="mt-3 text-xs text-stone-400 dark:text-zinc-500">
        ※ 本シミュレーターは 2025〜2027 年に対応しています。
        祝日・シーズン判定は参考値です。
      </p>
    </div>
  );
}
