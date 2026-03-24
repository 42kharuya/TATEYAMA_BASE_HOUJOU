/**
 * FeaturesSection — 特徴セクション（選ばれる理由）
 *
 * 目的: 施設の「選ばれる理由」を言語化し、予約への動機づけを強化する。
 *
 * 掲載情報（docs/FACTS.md の確定情報のみ使用）:
 *   - 1棟貸し（4〜8名）
 *   - 屋上テラス・1階ウッドデッキ
 *   - 室内アクティビティ（卓球・麻雀）
 *   - レンタル用品（SUP等）
 *   - 立地（海まで徒歩約30秒・館山駅から徒歩約9分）
 *
 * デザイン準拠: docs/DESIGN.md（余白・フォント・カラールール）
 * セマンティック: <section> > <h2> > カード内 <h3> で見出し階層を維持
 * IA.md: セクション順 4番目（料金の後・設備の前）
 */

import { ANCHOR_IDS } from "../_lib/anchors";
import { Section } from "./Section";

// ────────────────────────────────────────────────────────
// 特徴データ（docs/FACTS.md の確定情報のみ）
// 根拠のない断定（「最高」「No.1」等）は使わない
// ────────────────────────────────────────────────────────

type Feature = {
  /** カード見出し（h3） */
  title: string;
  /** 説明文（確定情報を使用・断定表現は避ける） */
  description: string;
  /** アイコンコンポーネント */
  Icon: () => React.JSX.Element;
};

// ────────────────────────────────────────────────────────
// アイコン（インライン SVG）
// aria-hidden="true" で装飾扱いとし、テキストで意味を伝える
// ────────────────────────────────────────────────────────

/** 家・建物アイコン（1棟貸し） */
function HouseIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 屋根 */}
      <path d="M3 9.5 12 3l9 6.5" />
      {/* 建物の外壁 */}
      <path d="M19 10v11H5V10" />
      {/* ドア */}
      <rect x="9" y="14" width="6" height="7" rx="0.5" />
    </svg>
  );
}

/** 太陽アイコン（屋上テラス・ウッドデッキ） */
function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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

/** ゲーム・卓球アイコン（室内アクティビティ） */
function TableTennisIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ラケット（円形ヘッド） */}
      <circle cx="9" cy="9" r="5" />
      {/* グリップ */}
      <line x1="13" y1="13" x2="20" y2="20" />
      {/* ボール */}
      <circle cx="19" cy="5" r="2" />
    </svg>
  );
}

/** 波・サップアイコン（レンタル用品） */
function SurfIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 波 2段 */}
      <path d="M2 9c.6.5 1.2 1 2.5 1C7 10 7 8 9.5 8c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 15c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  );
}

/** マップピンアイコン（立地） */
function MapPinIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ピン外形 */}
      <path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 1 1 16 0z" />
      {/* 中心の丸 */}
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────
// 特徴リスト（docs/FACTS.md の確定情報のみ）
// ────────────────────────────────────────────────────────

/**
 * 「選ばれる理由」5項目
 * すべて docs/FACTS.md の確定情報に基づく。
 * 「最高」「No.1」などの根拠なき断定は含まない。
 */
const FEATURES: Feature[] = [
  {
    title: "1棟貸し（4〜8名）",
    description:
      "グループや家族で全館を独占できる貸別荘です。人数に合わせて1階のみ、または1・2階の両フロアを使えます。",
    Icon: HouseIcon,
  },
  {
    title: "屋上テラス・1階ウッドデッキ",
    description:
      "屋外スペースを2か所確保。海風を感じながらくつろいだり、空を眺めたりと、室内とは違う時間を過ごせます。",
    Icon: SunIcon,
  },
  {
    title: "室内アクティビティ（卓球・麻雀）",
    description:
      "天気に左右されず楽しめる卓球台・麻雀台を2階に完備。滞在中に「やることが尽きない」工夫があります。",
    Icon: TableTennisIcon,
  },
  {
    title: "レンタル用品（SUP等）",
    description:
      "SUPをはじめとするレンタル用品を用意しています。海でのアクティビティを手ぶらで楽しみたい方に向いています。",
    Icon: SurfIcon,
  },
  {
    title: "海まで徒歩約30秒・館山駅から徒歩約9分",
    description:
      "北条海岸まで徒歩約30秒の好立地です。館山駅からも徒歩約9分でアクセスでき、車なしでも動きやすい環境です。",
    Icon: MapPinIcon,
  },
];

// ────────────────────────────────────────────────────────
// 特徴カード（1枚のカードを表示するコンポーネント）
// ────────────────────────────────────────────────────────

/**
 * FeatureCard — 個別の特徴を1枚のカードとして表示する
 *
 * 構成: アイコン（装飾）→ h3 見出し → 説明文
 * デザイン: bg-stone-100 / rounded-xl / shadow-sm（docs/DESIGN.md §8.5、Issue #23 でstone系に統一）
 */
function FeatureCard({ title, description, Icon }: Feature) {
  return (
    <article className="flex flex-col gap-4 rounded-xl bg-stone-100 p-6 shadow-sm dark:bg-zinc-800">
      {/* アイコン（装飾用。aria-hidden で読み上げをスキップ） */}
      <div
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm dark:bg-zinc-700 dark:text-stone-300"
      >
        <Icon />
      </div>
      {/*
       * h3: Section（h2）の下に置くことで見出し階層を維持する
       * docs/DESIGN.md §2.2 「階層を飛ばさない」
       */}
      <h3 className="text-lg font-semibold leading-snug text-stone-900 dark:text-zinc-50">
        {title}
      </h3>
      {/* 説明文: text-base / leading-7 で読みやすい行間を確保 */}
      <p className="text-base leading-7 text-stone-600 dark:text-zinc-400">
        {description}
      </p>
    </article>
  );
}

// ────────────────────────────────────────────────────────
// FeaturesSection（エクスポートするメインコンポーネント）
// ────────────────────────────────────────────────────────

/**
 * FeaturesSection — 特徴セクション（選ばれる理由）
 *
 * IA.md セクション順 4番目（料金の後・設備の前）。
 * Section コンポーネントを使うことでセクション間の余白・見出しスタイルを統一する。
 */
export function FeaturesSection() {
  return (
    // variant="tinted": カードと背景のコントラストを確保（Issue #25）
    <Section
      id={ANCHOR_IDS.features}
      title="選ばれる理由"
      lead="TATEYAMA BASE 北条が選ばれる5つのポイントをご紹介します。"
      variant="tinted"
    >
      {/*
       * カードグリッド
       * - モバイル: 1カラム
       * - sm（640px〜）: 2カラム
       * - lg（1024px〜）: 3カラム → 5枚 = 1行3枚 + 1行2枚
       * list/ul を使わずグリッドのみで並べる（独立した記事として article を使用）
       */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </Section>
  );
}
