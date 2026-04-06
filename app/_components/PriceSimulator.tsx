/**
 * PriceSimulator — 料金シミュレーター（複数泊対応）
 *
 * 役割: チェックイン日・チェックアウト日・宿泊人数を入力すると、
 *       各泊のシーズンを自動判定して合計料金を即時表示する。
 *
 * 技術:
 *   - "use client": ユーザー操作（日付選択・人数選択）に useState で反応するため
 *   - <input type="date">: ネイティブの日付ピッカー（外部ライブラリなし）
 *   - detectSeason: app/_lib/seasonDetector.ts の判定ロジックを使用
 *   - PRICING_ROWS / SEASONS: app/_lib/pricingData.ts の共有データを使用
 *
 * 計算の仕組み:
 *   チェックイン日〜チェックアウト前日まで1日ずつループし、
 *   各日のシーズンを判定して料金を積算する。
 *   例: 3泊（ハイ2泊＋オフ1泊）→ 各シーズンの料金を合計して表示する。
 *
 * 注意:
 *   - トップシーズン（GW・お盆等）が含まれる場合は参考料金として注意書きを出す
 *   - 祝日データは 2025〜2027 年分のみ精度が保証される
 *   - 最大連泊数: 14泊（極端な入力を防ぐ上限）
 */

"use client";

import { useState } from "react";

import type { SeasonKey } from "../_lib/seasonDetector";
import { CLEANING_FEES, PRICING_ROWS, SEASONS, yen } from "../_lib/pricingData";
import { detectSeason } from "../_lib/seasonDetector";

/** シミュレーターが保持する状態 */
type SimulatorState = {
  /** チェックイン日（"YYYY-MM-DD" 形式 or 空文字） */
  checkInStr: string;
  /** チェックアウト日（"YYYY-MM-DD" 形式 or 空文字） */
  checkOutStr: string;
  /** 宿泊人数（null = 未選択） */
  guests: number | null;
};

/** シーズン別の内訳（泊数と小計） */
type SeasonBreakdown = {
  key: SeasonKey;
  nights: number;
  subtotal: number;
};

/** 計算結果 */
type SimulatorResult = {
  /** 合計泊数 */
  nights: number;
  /** 宿泊料金合計（清掃費抜き・全泊分の積算） */
  accommodationTotal: number;
  /** 清掃費（宿泊全体で1回のみ） */
  cleaningFee: number;
  /** 合計料金（宿泊料金合計 + 清掃費） */
  total: number;
  /** シーズン別の内訳リスト（泊数が多いシーズン順） */
  breakdown: SeasonBreakdown[];
  /** トップシーズンが1泊でも含まれるか */
  hasTop: boolean;
};

/** 最大連泊数の上限 */
const MAX_NIGHTS = 14;

// ─────────────────────────────────────────────
// 計算ロジック（コンポーネント外で定義して再利用可能にする）
// ─────────────────────────────────────────────

/**
 * "YYYY-MM-DD" 文字列をローカル日付の Date に変換する
 * ※ new Date("YYYY-MM-DD") は UTC 解釈になるためタイムゾーンのずれが生じる。
 *    年・月・日に分解して new Date(y, m-1, d) とすることで正確なローカル日付になる。
 */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Date をローカル日付の "YYYY-MM-DD" 文字列に変換する
 *
 * NG: d.toISOString().slice(0, 10)
 *     → toISOString() は UTC に変換するため、JST（UTC+9）では
 *       深夜0時が前日の 15:00 UTC になり、日付が1日ずれる。
 *       スマホ（iOS Safari）は min 属性でグレーアウト表示するため
 *       このズレがユーザーに明確に見えてしまう。
 *
 * OK: 年・月・日をローカル値で取り出して文字列を組み立てる。
 */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * チェックイン日・チェックアウト日・人数から合計料金を計算する
 *
 * @returns 計算結果（SimulatorResult）または null（入力不足の場合）
 */
function calcResult(
  checkInStr: string,
  checkOutStr: string,
  guests: number,
  priceRow: (typeof PRICING_ROWS)[number]
): SimulatorResult | null {
  const checkIn = parseLocalDate(checkInStr);
  const checkOut = parseLocalDate(checkOutStr);

  // 泊数を計算する（ミリ秒差 → 日数）
  const msPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);

  if (nights <= 0 || nights > MAX_NIGHTS) return null;

  // シーズン別の集計マップ（初期値は全シーズン 0泊・0円）
  const map: Record<SeasonKey, SeasonBreakdown> = {
    offseason: { key: "offseason", nights: 0, subtotal: 0 },
    regular: { key: "regular", nights: 0, subtotal: 0 },
    high: { key: "high", nights: 0, subtotal: 0 },
    top: { key: "top", nights: 0, subtotal: 0 },
  };

  // チェックイン日〜チェックアウト前日まで1日ずつループして各泊のシーズンを判定する
  for (let i = 0; i < nights; i++) {
    const night = new Date(checkIn);
    night.setDate(night.getDate() + i); // i日目の宿泊日
    const key = detectSeason(night);
    map[key].nights += 1;
    map[key].subtotal += priceRow.prices[key];
  }

  // 泊数が0のシーズンを除いて、泊数降順で並べる
  const breakdown = Object.values(map)
    .filter((b) => b.nights > 0)
    .sort((a, b) => b.nights - a.nights);

  const accommodationTotal = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
  // 清掃費は連泊数・シーズンに関わらず1回のみ加算する（CLEANING_FEES で人数に応じた金額を取得）
  const cleaningFee = CLEANING_FEES[guests] ?? 0;
  const total = accommodationTotal + cleaningFee;
  const hasTop = map.top.nights > 0;

  return { nights, accommodationTotal, cleaningFee, total, breakdown, hasTop };
}

// ─────────────────────────────────────────────
// コンポーネント
// ─────────────────────────────────────────────

export function PriceSimulator() {
  // ── 状態管理 ──────────────────────────────────────
  const [state, setState] = useState<SimulatorState>({
    checkInStr: "",
    checkOutStr: "",
    guests: null,
  });

  // ── 計算 ──────────────────────────────────────────

  /**
   * 入力エラーメッセージを返す（なければ null）
   * 計算の前にバリデーションして UI にフィードバックする
   */
  const inputError = (() => {
    if (!state.checkInStr || !state.checkOutStr) return null; // 未入力は無視
    const checkIn = parseLocalDate(state.checkInStr);
    const checkOut = parseLocalDate(state.checkOutStr);
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round(
      (checkOut.getTime() - checkIn.getTime()) / msPerDay
    );
    if (nights <= 0)
      return "チェックアウト日はチェックイン日より後の日付を選んでください。";
    if (nights > MAX_NIGHTS)
      return `最大 ${MAX_NIGHTS} 泊まで計算できます。`;
    return null;
  })();

  /**
   * 全項目が入力済みかつエラーなしの場合のみ計算する
   */
  const result = (() => {
    if (!state.checkInStr || !state.checkOutStr || state.guests === null)
      return null;
    if (inputError) return null;
    const row = PRICING_ROWS.find((r) => r.guests === state.guests);
    if (!row) return null;
    return calcResult(state.checkInStr, state.checkOutStr, state.guests, row);
  })();

  /**
   * チェックアウト日 input の min 属性値を動的に計算する
   *
   * - チェックイン日が入力済みの場合: チェックイン日の翌日（チェックアウトは最低1泊後）
   * - チェックイン日が未入力の場合: 固定のフォールバック値
   *
   * これにより、チェックイン日を選んだあとカレンダーが適切な月から開いてUX改善される。
   */
  const checkOutMin = state.checkInStr
    ? (() => {
        const d = parseLocalDate(state.checkInStr);
        d.setDate(d.getDate() + 1); // 翌日を計算する
        return formatLocalDate(d); // ローカル日付で "YYYY-MM-DD" に変換（UTC変換しない）
      })()
    : "2025-01-02"; // チェックイン未入力時のフォールバック

  // ── イベントハンドラー ─────────────────────────────

  /**
   * チェックイン日が変更されたときのハンドラー
   *
   * 【iOS Safari 対応の重要な実装ポイント】
   * iOS Safari の <input type="date"> はスクロールピッカー UIを使っており、
   * `min` 属性はグレーアウト範囲を決めるだけで、ピッカーの初期スクロール位置は
   * `value` 属性（設定値）または「今日」になる。
   * → チェックアウトを空文字にリセットすると、iOS では今日の位置からピッカーが
   *   開いてしまい、目的の月まで手動スクロールが必要になる。
   *
   * 対策: チェックアウトが無効（空 or min より前）になる場合は、
   *       空文字ではなく min（チェックイン翌日）を初期値としてセットする。
   *       これにより iOS Safari も正しい日付を value として持ち、
   *       ピッカーがチェックイン翌日の位置から開く。
   */
  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newCheckIn = e.target.value;
    setState((prev) => {
      if (!newCheckIn) {
        // チェックインをクリアした場合はチェックアウトも空にする
        return { ...prev, checkInStr: "", checkOutStr: "" };
      }
      // 新しいチェックイン日に対する min（翌日）を計算する
      const d = parseLocalDate(newCheckIn);
      d.setDate(d.getDate() + 1);
      const newCheckOutMin = formatLocalDate(d); // ローカル日付で変換（UTC変換しない）

      // チェックアウトが有効（min 以上）なら維持、そうでなければ min を初期値にセット
      // ※ iOS Safari 対応: 空文字ではなく min をセットすることで
      //   ピッカーがチェックイン翌日の位置から開くようになる
      const checkOutStr =
        prev.checkOutStr && prev.checkOutStr >= newCheckOutMin
          ? prev.checkOutStr
          : newCheckOutMin;
      return { ...prev, checkInStr: newCheckIn, checkOutStr };
    });
  }

  function handleCheckOutChange(e: React.ChangeEvent<HTMLInputElement>) {
    setState((prev) => ({ ...prev, checkOutStr: e.target.value }));
  }

  function handleGuestsSelect(guests: number) {
    setState((prev) => ({ ...prev, guests }));
  }

  // ── レンダリング ───────────────────────────────────

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-zinc-700 dark:bg-zinc-900/60">
      {/* カードヘッダー */}
      <p className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
        料金シミュレーター
      </p>
      <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
        チェックイン・アウト日と人数を選ぶと、概算合計料金をその場で確認できます。
      </p>

      {/* ── 入力エリア ── */}
      <div className="mt-4 space-y-4">
        {/* チェックイン日・チェックアウト日（横並び） */}
        {/*
         * sm:grid-cols-2: PC では横並び、モバイルでは縦積みにする
         * min-w-0: CSS Grid の子要素はデフォルトで min-width: auto（コンテンツ幅）になる。
         *   <input type="date"> はブラウザ固有の最小幅を持つため、div と input 両方に min-w-0 を付けることで
         *   w-full（width:100%）が正しく機能してカード内に収まる。
         */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* チェックイン日 */}
          <div className="min-w-0">
            <label
              htmlFor="sim-checkin"
              className="block text-sm font-medium text-stone-700 dark:text-zinc-300"
            >
              チェックイン日
            </label>
            <input
              id="sim-checkin"
              type="date"
              min="2025-01-01"
              max="2027-12-31"
              value={state.checkInStr}
              onChange={handleCheckInChange}
              className="mt-1 block w-full appearance-none rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm text-stone-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-sky-400 dark:focus:ring-sky-400"
            />
          </div>
          {/* チェックアウト日 */}
          <div className="min-w-0">
            <label
              htmlFor="sim-checkout"
              className="block text-sm font-medium text-stone-700 dark:text-zinc-300"
            >
              チェックアウト日
            </label>
            <input
              id="sim-checkout"
              type="date"
              min={checkOutMin}
              max="2027-12-31"
              value={state.checkOutStr}
              onChange={handleCheckOutChange}
              className="mt-1 block w-full appearance-none rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm text-stone-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-sky-400 dark:focus:ring-sky-400"
            />
          </div>
        </div>

        {/* 入力エラーメッセージ */}
        {inputError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            {inputError}
          </p>
        )}

        {/* 宿泊人数ボタン */}
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">
            宿泊人数
          </p>
          {/*
           * 4〜8名を横並びボタンで選択する
           * aria-pressed: 現在選択中のボタンをスクリーンリーダーに伝える
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
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-sky-600 bg-sky-700 text-white dark:border-sky-500 dark:bg-sky-600"
                      : "border-stone-200 bg-white text-stone-700 hover:border-sky-300 hover:bg-sky-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-sky-500 dark:hover:bg-sky-950"
                  }`}
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
          /* 未入力・エラー時のプレースホルダー */
          <p className="text-center text-sm text-stone-400 dark:text-zinc-500">
            日付と人数を選ぶと合計料金が表示されます
          </p>
        ) : (
          <div className="space-y-3">
            {/* 泊数バッジ */}
            <p className="text-xs font-medium text-stone-500 dark:text-zinc-400">
              {result.nights}泊 /{" "}
              {PRICING_ROWS.find((r) => r.guests === state.guests)?.note}
            </p>

            {/* 合計料金（大きく表示） */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-stone-900 dark:text-zinc-50">
                {yen(result.total)}
              </span>
              <span className="text-sm text-stone-500 dark:text-zinc-400">
                合計（清掃費込み）
              </span>
            </div>

            {/* 内訳（シーズン別 + 清掃費）
             * シーズン行：各シーズンの泊数と小計
             * 宿泊料金合計：全シーズンの合算
             * 清掃費：泊数に関わらず1回のみ
             */}
            <div className="space-y-1 border-t border-stone-100 pt-2 dark:border-zinc-700">
              <p className="text-xs font-medium text-stone-500 dark:text-zinc-400">
                内訳
              </p>
              {result.breakdown.map((b) => {
                // シーズン定義（ラベル・バッジカラー）を取得する
                const config = SEASONS.find((s) => s.key === b.key)!;
                return (
                  <div
                    key={b.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {/* シーズンバッジ */}
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${config.badgeColor}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-stone-600 dark:text-zinc-400">
                        {b.nights}泊
                      </span>
                    </div>
                    {/* 小計 */}
                    <span className="tabular-nums text-stone-700 dark:text-zinc-300">
                      {yen(b.subtotal)}
                    </span>
                  </div>
                );
              })}
              {/* 宿泊料金合計（全シーズンの合算・清掃費抬き） */}
              <div className="flex items-center justify-between border-t border-stone-100 pt-1 text-sm dark:border-zinc-700">
                <span className="text-stone-600 dark:text-zinc-400">宿泊料金合計</span>
                <span className="tabular-nums text-stone-700 dark:text-zinc-300">
                  {yen(result.accommodationTotal)}
                </span>
              </div>
              {/* 清掃費（宿泊全体で1回のみ加算される） */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600 dark:text-zinc-400">清掃費（1回）</span>
                <span className="tabular-nums text-stone-700 dark:text-zinc-300">
                  {yen(result.cleaningFee)}
                </span>
              </div>
            </div>

            {/* トップシーズンが含まれる場合の注意書き */}
            {result.hasTop && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700 dark:bg-red-950 dark:text-red-300">
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
