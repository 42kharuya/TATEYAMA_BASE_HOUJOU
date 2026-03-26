/**
 * SeasonCalendar — 月カレンダービジュアル
 *
 * 役割: 1〜12月を横並びで表示し、各月をシーズンカラーでハイライトする。
 *       「自分の宿泊月がどのシーズンか」を色で直感的に伝えるコンポーネント。
 *
 * "use client" にしている理由:
 *   現在月を強調表示するために new Date() を使う必要があり、
 *   サーバーサイドとクライアントサイドで値がズレないよう
 *   クライアントコンポーネントとして定義する。
 *
 * データ依存:
 *   SEASONS（app/_lib/pricingData.ts）の months 配列から色を導出する。
 *   月のハードコードなし。
 */

"use client";

import { SEASONS } from "../_lib/pricingData";

/** 日本語の月略称（1〜12月） */
const MONTH_LABELS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
] as const;

/**
 * SEASONS データから「月番号 → シーズン設定」のマップを生成する。
 * ループで毎回計算する代わりに一度だけ作成してキャッシュする。
 *
 * 例: { 1: offseason設定, 5: top設定, ... }
 */
const MONTH_SEASON_MAP = new Map(
  SEASONS.flatMap((season) => season.months.map((m) => [m, season]))
);

export function SeasonCalendar() {
  /**
   * 現在月を取得する（1〜12の数値）。
   * クライアントコンポーネントなので new Date() はブラウザ上で実行される。
   */
  const currentMonth = new Date().getMonth() + 1; // getMonth() は 0 始まりなので +1

  return (
    <div className="mt-4">
      {/*
       * grid-cols-4: モバイルは4列（3行）
       * sm:grid-cols-6: タブレットは6列（2行）
       * lg:grid-cols-12: PCは12列（1行）
       * これにより "折り返して適切に表示される" AC を満たす
       */}
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
        {MONTH_LABELS.map((label, i) => {
          const month = i + 1; // 月番号（1〜12）
          const season = MONTH_SEASON_MAP.get(month); // その月のシーズン設定を取得
          const isCurrentMonth = month === currentMonth;

          return (
            <div
              key={month}
              className={[
                "flex flex-col items-center justify-center rounded-lg py-2 text-center text-xs font-medium transition-shadow",
                /*
                 * シーズンカラーを適用。
                 * season が undefined のときはフォールバックとして石色（デフォルト）を使う。
                 */
                season
                  ? season.calendarColor
                  : "bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-400",
                /*
                 * 現在月は ring（輪郭線）でハイライト。
                 * ring-2 で細いボーダーを付け、ring-offset-1 で背景との間に隙間を作る。
                 * ring-stone-400: リングの色（シーズン問わず統一）
                 */
                isCurrentMonth
                  ? "ring-2 ring-stone-400 ring-offset-1 dark:ring-zinc-400"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`${label}${season ? `（${season.label}シーズン）` : ""}${isCurrentMonth ? "・今月" : ""}`}
            >
              <span className="leading-none">{label}</span>
              {isCurrentMonth && (
                /* 現在月の下には小さな "今月" ラベルを表示してわかりやすくする */
                <span className="mt-0.5 text-[10px] opacity-70">今月</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 凡例: どの色がどのシーズンかを説明する */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {SEASONS.map((season) => (
          <div key={season.key} className="flex items-center gap-1.5">
            {/* 色見本の正方形 */}
            <span
              className={`h-3 w-3 rounded-sm ${season.calendarColor}`}
              aria-hidden="true"
            />
            {/* シーズン名 */}
            <span className="text-xs text-stone-600 dark:text-zinc-400">
              {season.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
