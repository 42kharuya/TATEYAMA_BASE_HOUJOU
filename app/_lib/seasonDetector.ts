/**
 * seasonDetector — 宿泊日 → シーズン判定
 *
 * 役割: 日付（Date）を受け取り、料金シーズンキーを返す純粋関数を提供する。
 *       外部APIや外部ライブラリに依存せず、祝日・トップシーズン期間を
 *       固定配列で管理する。
 *
 * 判定優先順位（高い順）:
 *   1. top      — トップシーズン固定期間リスト内
 *   2. high     — 土曜 / 夏季（7/10〜9/10、お盆除く）/ 祝前日 / 3連休中日
 *   3. regular  — 日曜 / 祝日 / 春休み（3/20〜4/7）
 *   4. offseason — それ以外
 *
 * データ根拠: docs/FACTS.md
 * 注意: 2025〜2027 年の祝日を固定配列で管理。それ以外の年は精度が下がる。
 */

/** シーズンを識別するキー */
export type SeasonKey = "offseason" | "regular" | "high" | "top";

// ─────────────────────────────────────────────
// 内部ユーティリティ
// ─────────────────────────────────────────────

/**
 * Date を "YYYY-MM-DD" 形式の文字列に変換する
 * ※ ローカル時刻で計算する（タイムゾーンのずれを防ぐため）
 */
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─────────────────────────────────────────────
// 祝日データ（2025〜2027 年）
// 根拠: 内閣府「国民の祝日について」
// 振替休日・国民の休日を含む
// ─────────────────────────────────────────────
const HOLIDAYS = new Set<string>([
  // 2025 年
  "2025-01-01", // 元日
  "2025-01-13", // 成人の日
  "2025-02-11", // 建国記念の日
  "2025-02-23", // 天皇誕生日
  "2025-02-24", // 振替休日
  "2025-03-20", // 春分の日
  "2025-04-29", // 昭和の日
  "2025-05-03", // 憲法記念日
  "2025-05-04", // みどりの日
  "2025-05-05", // こどもの日
  "2025-05-06", // 振替休日
  "2025-07-21", // 海の日
  "2025-08-11", // 山の日
  "2025-09-15", // 敬老の日
  "2025-09-22", // 振替休日
  "2025-09-23", // 秋分の日
  "2025-10-13", // スポーツの日
  "2025-11-03", // 文化の日
  "2025-11-23", // 勤労感謝の日
  "2025-11-24", // 振替休日

  // 2026 年
  "2026-01-01", // 元日
  "2026-01-12", // 成人の日
  "2026-02-11", // 建国記念の日
  "2026-02-23", // 天皇誕生日
  "2026-03-20", // 春分の日
  "2026-04-29", // 昭和の日
  "2026-05-03", // 憲法記念日
  "2026-05-04", // みどりの日
  "2026-05-05", // こどもの日
  "2026-05-06", // 振替休日
  "2026-07-20", // 海の日
  "2026-08-11", // 山の日
  "2026-09-21", // 敬老の日
  "2026-09-22", // 秋分の日
  "2026-10-12", // スポーツの日
  "2026-11-03", // 文化の日
  "2026-11-23", // 勤労感謝の日

  // 2027 年
  "2027-01-01", // 元日
  "2027-01-11", // 成人の日
  "2027-02-11", // 建国記念の日
  "2027-02-23", // 天皇誕生日
  "2027-03-21", // 春分の日
  "2027-04-29", // 昭和の日
  "2027-05-03", // 憲法記念日
  "2027-05-04", // みどりの日
  "2027-05-05", // こどもの日
  "2027-07-19", // 海の日
  "2027-08-11", // 山の日
  "2027-09-20", // 敬老の日
  "2027-09-23", // 秋分の日
  "2027-10-11", // スポーツの日
  "2027-11-03", // 文化の日
  "2027-11-23", // 勤労感謝の日
  "2027-11-24", // 振替休日
]);

// ─────────────────────────────────────────────
// トップシーズン期間（固定）
// 根拠: docs/FACTS.md
// ─────────────────────────────────────────────

/** 期間を "YYYY-MM-DD" の start / end（両端含む）で表す型 */
type DateRange = { start: string; end: string };

/**
 * トップシーズンの固定期間リスト
 * - GW:        4/29〜5/6（毎年）
 * - お盆:      8/13〜8/16（毎年）
 * - 年末年始:  12/28〜翌1/7（毎年）
 * - シルバーウィーク: 発生する年のみ
 *   - 2025年: 9/13〜9/23（土〜秋分の日）
 */
const TOP_SEASON_RANGES: DateRange[] = [];

// 各年の固定期間を生成する
for (const year of [2025, 2026, 2027]) {
  // GW
  TOP_SEASON_RANGES.push({
    start: `${year}-04-29`,
    end: `${year}-05-06`,
  });
  // お盆
  TOP_SEASON_RANGES.push({
    start: `${year}-08-13`,
    end: `${year}-08-16`,
  });
  // 年末（〜12/31）
  TOP_SEASON_RANGES.push({
    start: `${year}-12-28`,
    end: `${year}-12-31`,
  });
  // 年始（1/1〜1/7）
  TOP_SEASON_RANGES.push({
    start: `${year}-01-01`,
    end: `${year}-01-07`,
  });
}
// シルバーウィーク 2025（9/13 土〜9/23 秋分の日）
TOP_SEASON_RANGES.push({ start: "2025-09-13", end: "2025-09-23" });

// ─────────────────────────────────────────────
// 判定ヘルパー関数（モジュール内部のみ使用）
// ─────────────────────────────────────────────

/** 日付がトップシーズン固定期間内かどうかを返す */
function isTopSeason(date: Date): boolean {
  const ts = toDateString(date);
  return TOP_SEASON_RANGES.some(({ start, end }) => ts >= start && ts <= end);
}

/** 日付が祝日（HOLIDAYS セット内）かどうかを返す */
function isHoliday(date: Date): boolean {
  return HOLIDAYS.has(toDateString(date));
}

/**
 * 日付が「祝前日（翌日が祝日）」かどうかを返す
 * 例: 1/12（日曜）の前日 1/12 → 1/13 が成人の日なら祝前日
 */
function isHolidayEve(date: Date): boolean {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return isHoliday(next);
}

/**
 * 日付が「3連休以上の連続した非稼働日の中日」かどうかを返す
 * 判定: 前日・翌日がともに非稼働日（土日 or 祝日）であること
 * ※ 厳密な「3連休の2日目」の完全再現は複雑なため、
 *    「連続3日以上の中にある」で近似する
 */
function isMiddleOfConsecutiveHoliday(date: Date): boolean {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  // 非稼働日かどうか（土日 or 祝日）
  const isNonWork = (d: Date): boolean =>
    d.getDay() === 0 || d.getDay() === 6 || isHoliday(d);

  return isNonWork(prev) && isNonWork(next);
}

/**
 * 日付が夏季ハイシーズン（7/10〜9/10）かどうかを返す
 * お盆期間（8/13〜8/16）はトップシーズンに昇格するため除外
 */
function isHighSeasonSummer(date: Date): boolean {
  const m = date.getMonth() + 1; // 1〜12
  const d = date.getDate();

  const inRange =
    (m === 7 && d >= 10) || // 7/10〜7/31
    m === 8 || // 8月全体
    (m === 9 && d <= 10); // 9/1〜9/10

  if (!inRange) return false;

  // お盆（8/13〜8/16）はトップシーズンのため除外
  const isObon = m === 8 && d >= 13 && d <= 16;
  return !isObon;
}

/**
 * 日付が春休み（3/20〜4/7）かどうかを返す
 * 定義: 春分の日ごろ〜入学式前を春休みとして扱う
 */
function isSpringBreak(date: Date): boolean {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return (m === 3 && d >= 20) || (m === 4 && d <= 7);
}

// ─────────────────────────────────────────────
// 公開 API
// ─────────────────────────────────────────────

/**
 * 日付（Date）からシーズンキーを判定して返す
 *
 * 優先順位（高い順）:
 *   top > high > regular > offseason
 *
 * @param date - 判定したい宿泊日
 * @returns シーズンキー
 *
 * @example
 * detectSeason(new Date("2025-08-14")); // => "top"（お盆期間）
 * detectSeason(new Date("2025-08-02")); // => "high"（7/10〜9/10・夏季）
 * detectSeason(new Date("2025-01-20")); // => "regular"（成人の日翌日、月曜祝日）
 * detectSeason(new Date("2025-02-04")); // => "offseason"（火曜・平日）
 */
export function detectSeason(date: Date): SeasonKey {
  // 1. トップシーズン（固定期間リスト）
  if (isTopSeason(date)) return "top";

  const dow = date.getDay(); // 0=日曜, 6=土曜

  // 2. ハイシーズン
  if (
    dow === 6 || // 土曜日
    isHighSeasonSummer(date) || // 夏季（7/10〜9/10、お盆除く）
    isHolidayEve(date) || // 祝前日
    isMiddleOfConsecutiveHoliday(date) // 3連休以上の中日
  ) {
    return "high";
  }

  // 3. レギュラーシーズン
  if (
    dow === 0 || // 日曜日
    isHoliday(date) || // 祝日
    isSpringBreak(date) // 春休み（3/20〜4/7）
  ) {
    return "regular";
  }

  // 4. オフシーズン
  return "offseason";
}
