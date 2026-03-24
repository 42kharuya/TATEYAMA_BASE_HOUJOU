/**
 * FacilitiesSection — 設備セクション（フロア別一覧）
 *
 * 目的: 宿泊前に「何があるか」を場所（フロア）別に整理して伝える。
 *
 * 掲載情報（docs/FACTS.md の確定情報のみ使用）:
 *   - 屋外：駐車スペース1台、屋外シャワー、EVコンセント（EV車2台まで）
 *   - 1階：大型テレビ、ベッド4台、キッチン一式、トイレ、バスルーム、
 *           ドライヤー、洗濯機・乾燥機、ウッドデッキ
 *   - 2階：卓球台、麻雀台、ベッド4台、トイレ
 *   - 屋上：屋上テラス
 *   - その他：無料Wifi、エアコン
 *
 * 除外情報: アメニティ（未確定のため掲載しない、docs/REQUIREMENTS.md 準拠）
 *
 * デザイン準拠: docs/DESIGN.md（余白・フォント・カラールール）
 * セマンティック: <section> > <h2> > フロアカード内 <h3> で見出し階層を維持
 * IA.md: セクション順 5番目（特徴の後・アクセスの前）
 */

import { ANCHOR_IDS } from "../_lib/anchors";
import { Section } from "./Section";

// ────────────────────────────────────────────────────────
// フロア別設備データ（docs/FACTS.md の確定情報のみ）
// アメニティは未確定のため含めない（docs/REQUIREMENTS.md 準拠）
// ────────────────────────────────────────────────────────

type FloorFacility = {
  /** フロア名（h3 の見出しに使用） */
  floor: string;
  /** 設備一覧（確定情報のみ） */
  items: string[];
  /** アイコンコンポーネント（装飾・aria-hidden） */
  Icon: () => React.JSX.Element;
};

// ────────────────────────────────────────────────────────
// アイコン（インライン SVG）
// aria-hidden="true" で装飾扱いとし、テキストで意味を伝える
// ────────────────────────────────────────────────────────

/** 木・屋外アイコン（屋外エリア） */
function OutdoorIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 木の幹 */}
      <line x1="12" y1="22" x2="12" y2="10" />
      {/* 木の枝（三角形を重ねて木の形） */}
      <path d="M12 10 L6 17 L18 17 Z" />
      <path d="M12 6 L7 12 L17 12 Z" />
    </svg>
  );
}

/** 家・1階アイコン */
function FirstFloorIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 屋根 */}
      <path d="M3 9.5 12 3l9 6.5" />
      {/* 建物外壁 */}
      <path d="M19 10v11H5V10" />
      {/* ドア */}
      <rect x="9" y="14" width="6" height="7" rx="0.5" />
    </svg>
  );
}

/** 2階アイコン（積み重ねた四角） */
function SecondFloorIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 下の階 */}
      <rect x="3" y="13" width="18" height="8" rx="1" />
      {/* 上の階 */}
      <rect x="5" y="5" width="14" height="8" rx="1" />
    </svg>
  );
}

/** 屋上テラスアイコン（太陽） */
function RooftopIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 太陽の円 */}
      <circle cx="12" cy="12" r="4" />
      {/* 放射線 8本 */}
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

/** その他アイコン（スター） */
function OtherIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Wifi波形 */}
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      {/* 中心ドット */}
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────
// フロア別設備データ（docs/FACTS.md に基づく）
// ────────────────────────────────────────────────────────

const FLOOR_FACILITIES: FloorFacility[] = [
  {
    floor: "屋外",
    Icon: OutdoorIcon,
    // 根拠: docs/FACTS.md「駐車場・屋外設備」
    items: [
      "駐車スペース（1台）",
      "屋外シャワー",
      "EVコンセント（EV車2台まで）",
    ],
  },
  {
    floor: "1階",
    Icon: FirstFloorIcon,
    // 根拠: docs/FACTS.md「1階（ウッドデッキ付き）」
    items: [
      "大型テレビ",
      "ベッド（4台）",
      "キッチン一式（冷蔵庫・電子レンジ・炊飯器・食器類・調理器具）",
      "トイレ",
      "バスルーム",
      "ドライヤー",
      "洗濯機・乾燥機",
      "ウッドデッキ",
    ],
  },
  {
    floor: "2階",
    Icon: SecondFloorIcon,
    // 根拠: docs/FACTS.md「2階」
    items: ["卓球台", "麻雀台", "ベッド（4台）", "トイレ"],
  },
  {
    floor: "屋上",
    Icon: RooftopIcon,
    // 根拠: docs/FACTS.md「屋上」
    items: ["屋上テラス"],
  },
  {
    floor: "その他",
    Icon: OtherIcon,
    // 根拠: docs/FACTS.md「その他」
    items: ["無料Wi-Fi", "エアコン"],
  },
];

// ────────────────────────────────────────────────────────
// フロアカードコンポーネント
// h3 で各フロア名を示す（h2 > h3 の見出し階層を維持）
// ────────────────────────────────────────────────────────

type FloorCardProps = {
  facility: FloorFacility;
};

/**
 * フロアカード
 * 1フロア分の設備を箇条書きで表示する。
 * h3 を使うことで、Section（h2）→ FloorCard（h3）の見出し階層を維持。
 */
function FloorCard({ facility }: FloorCardProps) {
  const { floor, Icon, items } = facility;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800/60">
      {/* フロア見出し（h3）：アイコン + フロア名をセットで表示 */}
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-zinc-50">
        {/* アイコンは装飾扱い（aria-hidden はアイコン側で設定済み）
         * テキストのフロア名でスクリーンリーダーに意味を伝える
         */}
        <span className="text-sky-600 dark:text-sky-400">
          <Icon />
        </span>
        {floor}
      </h3>

      {/* 設備一覧：箇条書きで漏れなく表示 */}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-stone-700 dark:text-zinc-300"
          >
            {/* チェックマーク（装飾）— aria-hidden で読み上げをスキップ */}
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-sky-500">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// FacilitiesSection（エクスポートするメインコンポーネント）
// ────────────────────────────────────────────────────────

/**
 * FacilitiesSection
 * フロア別（屋外・1階・2階・屋上・その他）に設備を一覧表示する。
 *
 * レイアウト: レスポンシブグリッド（スマホ1列 → タブレット2列 → PC3列）
 * アクセシビリティ: id={ANCHOR_IDS.facilities} でヘッダーナビとページ内リンクに対応
 */
export function FacilitiesSection() {
  return (
    // Section コンポーネントが <section id="..."> + h2 + lead テキスト を担当
    <Section
      id={ANCHOR_IDS.facilities}
      title="施設・設備"
      lead="1棟まるごとお使いいただける全フロアの設備をご確認ください。アメニティ（シャンプー等）は準備中です。"
    >
      {/*
       * フロア別カードのグリッドレイアウト
       * - スマホ：1列（縦積み）
       * - タブレット（sm）：2列
       * - PC（lg）：3列
       * DESIGN.md にある「1画面に詰め込みすぎない」を意識してカード間に gap を設定
       */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FLOOR_FACILITIES.map((facility) => (
          <FloorCard key={facility.floor} facility={facility} />
        ))}
      </div>
    </Section>
  );
}
