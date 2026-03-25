/**
 * FeaturesSection — 特徴セクション（選ばれる理由）
 *
 * 目的: 施設の「選ばれる理由」を写真付きビジュアルカードで訴求し、予約への動機づけを強化する。
 *
 * 掲載情報（docs/FACTS.md の確定情報のみ使用）:
 *   - 1棟貸し（4〜8名）
 *   - 屋上テラス
 *   - 1階ウッドデッキ
 *   - 室内アクティビティ（卓球・麻雀）
 *   - レンタル用品（SUP等）
 *
 * Issue #35: アイコン → 写真へ刷新。PC で左右交互の2カラム、スマホで縦積みレイアウト。
 * デザイン準拠: docs/DESIGN.md（余白・フォント・カラールール）
 * セマンティック: <section> > <h2> > カード内 <h3> で見出し階層を維持
 * IA.md: セクション順 4番目（料金の後・設備の前）
 */

import Image, { type StaticImageData } from "next/image";

// ────────────────────────────────────────────────────────
// 写真のインポート（imgs/ 以下。next/image が最適化する）
// StaticImport を使うと width / height が自動で取得され、CLS（レイアウトズレ）を防げる
// ────────────────────────────────────────────────────────
import livingImg from "../../imgs/living.jpg";
import rooftopImg from "../../imgs/rooftop-terrace.jpg";
import woodTerraceImg from "../../imgs/wood-terrace.jpg";
import tableTennisImg from "../../imgs/table-tennis.jpg";
import sapImg from "../../imgs/sap.jpg";

import { ANCHOR_IDS } from "../_lib/anchors";
import { Section } from "./Section";

// ────────────────────────────────────────────────────────
// 特徴データ型（Issue #35: Icon を削除し image / alt を追加）
// ────────────────────────────────────────────────────────

type Feature = {
  /** カード見出し（h3） */
  title: string;
  /** 説明文（確定情報を使用・断定表現は避ける） */
  description: string;
  /**
   * 代表写真（next/image の StaticImageData）
   * next/image に渡すと自動で WebP 変換・リサイズが行われる
   */
  image: StaticImageData;
  /**
   * 画像の alt テキスト（アクセシビリティ必須）
   * docs/DESIGN.md §3 「画像の alt は内容を具体的に書く」
   */
  alt: string;
};

// ────────────────────────────────────────────────────────
// 特徴リスト（docs/FACTS.md の確定情報のみ）
// 注: 立地情報（海まで徒歩約30秒等）は AccessSection でカバーするため除外
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
    image: livingImg,
    alt: "リビングの様子。ソファや広い室内が見える",
  },
  {
    title: "屋上テラス",
    description:
      "屋上に専用テラスを確保。海風を感じながら空を見上げる時間は、室内では得られない開放感があります。",
    image: rooftopImg,
    alt: "屋上テラスの様子。青空と海が見渡せる",
  },
  {
    title: "1階ウッドデッキ",
    description:
      "1階の屋外にウッドデッキを設置。アウトドアシャワーと合わせて、砂浜からそのままくつろげる動線です。",
    image: woodTerraceImg,
    alt: "1階ウッドデッキの様子",
  },
  {
    title: "室内アクティビティ（卓球・麻雀）",
    description:
      "天気に左右されず楽しめる卓球台・麻雀台を2階に完備。滞在中に「やることが尽きない」工夫があります。",
    image: tableTennisImg,
    alt: "卓球台の様子",
  },
  {
    title: "レンタル用品（SUP等）",
    description:
      "SUPをはじめとするレンタル用品を用意しています。海でのアクティビティを手ぶらで楽しみたい方に向いています。",
    image: sapImg,
    alt: "サップ（SUP）のレンタル用品の様子",
  },
];

// ────────────────────────────────────────────────────────
// FeatureCard（写真付きビジュアルカード）
// ────────────────────────────────────────────────────────

/**
 * FeatureCard — 個別の特徴を写真付きビジュアルカードとして表示する
 *
 * レイアウト:
 *   - スマホ: 写真上 + テキスト下（flex-col）
 *   - PC (sm〜): 写真と テキストを横並び（flex-row）
 *     - reversed=true のとき写真を右に配置（flex-row-reverse）で左右交互を実現
 *
 * 写真:
 *   - モバイル: aspect-[4/3]（アスペクト比を固定してレイアウトズレを防ぐ）
 *   - PC: 親の高さに合わせて伸縮（self-stretch + position:relative + Image fill）
 *   - next/image の sizes でレスポンシブ画像配信を最適化
 *
 * デザイン: rounded-xl / shadow-sm / bg-stone-100（Issue #23 stone系カラー統一）
 */
function FeatureCard({
  title,
  description,
  image,
  alt,
  reversed,
}: Feature & {
  /**
   * true のとき写真を右側に配置（左右交互レイアウト用）
   * PC では flex-row-reverse で順序を反転する
   */
  reversed: boolean;
}) {
  return (
    <article
      className={[
        "flex overflow-hidden rounded-xl bg-stone-100 shadow-sm dark:bg-zinc-800",
        // スマホ: 縦積み（写真上・テキスト下）
        "flex-col",
        // SM以上: 横並び。reversed の場合は写真を右へ
        reversed ? "sm:flex-row-reverse" : "sm:flex-row",
      ].join(" ")}
    >
      {/* ── 写真エリア ── */}
      {/*
       * モバイル: aspect-[4/3] で縦高さを確保（fill を使うために relative が必要）
       * PC: sm:w-1/2 で半分の幅、sm:aspect-auto で aspect-[4/3] を解除し
       *     自分自身の高さはテキスト側に合わせる（self-stretch は親 flex が決める）
       */}
      <div className="relative aspect-[4/3] sm:aspect-auto sm:w-1/2">
        <Image
          src={image}
          alt={alt}
          fill
          /*
           * object-cover: 写真のアスペクト比を保ちつつ枠全体を覆う
           * コンテナに収まらない部分はクリップされる
           */
          className="object-cover"
          /*
           * sizes: ブラウザが事前に読み込む画像サイズを最適化するヒント
           * スマホ（100vw）+ PC（50vw = 2カラムの片方）
           */
          sizes="(min-width: 640px) 50vw, 100vw"
        />
      </div>

      {/* ── テキストエリア ── */}
      {/*
       * justify-center: 写真と高さが合わないとき縦方向に中央揃え
       * sm:w-1/2: PC では写真と同じ幅の半分を占める
       */}
      <div className="flex flex-col justify-center gap-4 p-6 sm:w-1/2">
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
      </div>
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
       * ビジュアルカードリスト
       * - 各カードが1行を占める縦積み（gap-6 で間隔を確保）
       * - PC では各カード内部が左右2カラムになる（FeatureCard 内の flex-row）
       * - 奇数番目のカード（index が奇数）は写真を右側に反転（reversed=true）
       *   → 交互配置により単調さを避け、視線の流れを作る
       */}
      <div className="flex flex-col gap-6">
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            {...feature}
            reversed={index % 2 !== 0}
          />
        ))}
      </div>
    </Section>
  );
}
