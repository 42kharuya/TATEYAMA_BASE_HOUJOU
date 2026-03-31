/**
 * FeaturesSection — 特徴セクション（魅力）
 *
 * 目的: 施設の「魅力」を写真付きで訴求し、予約への動機づけを強化する。
 *
 * 掲載情報（docs/FACTS.md の確定情報のみ使用）:
 *   - 1棟貸し（4〜8名）
 *   - 屋上テラス
 *   - 1階ウッドデッキ
 *   - 室内アクティビティ（卓球・麻雀）
 *   - レンタル用品（SUP等）
 *
 * Issue #35: アイコン → 写真へ刷新。PC で左右交互の2カラム、スマホで縦積みレイアウト。
 * Issue #46: カード廃止・エディトリアルレイアウトへ刷新。
 *   - 箱（bg-stone-100 / rounded-xl / shadow-sm）を撤去し余白と仕切り線で区切る
 *   - PC: 写真幅 60%（3/5）、モバイル: aspect-[16/9] でシネマティック比率
 *   - 写真に rounded-lg を適用して柔らかさを残す
 *   - Section variant を default（白背景）に変更し写真の色が際立つようにする
 * デザイン準拠: docs/DESIGN.md（余白・フォント・カラールール）
 * セマンティック: <section> > <h2> > カード内 <h3> で見出し階層を維持
 * IA.md: セクション順 3番目（Aboutの後・ Galleryの前）
 */

import Image, { type StaticImageData } from "next/image";

// ────────────────────────────────────────────────────────
// 写真のインポート（imgs/ 以下。next/image が最適化する）
// StaticImport を使うと width / height が自動で取得され、CLS（レイアウトズレ）を防げる
// ────────────────────────────────────────────────────────
import rooftopImg from "../../imgs/rooftop-terrace.jpg";
import woodTerraceImg from "../../imgs/wood-terrace.jpg";
import tableTennisImg from "../../imgs/facility-table-tennis.jpg";
import sapImg from "../../imgs/rental-sup.jpg";

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
// 注: 立地情報（海まで徒歩約2分等）は AccessSection でカバーするため除外
// ────────────────────────────────────────────────────────

/**
 * 「魅力」5項目
 * すべて docs/FACTS.md の確定情報に基づく。
 * 「最高」「No.1」などの根拠なき断定は含まない。
 */
const FEATURES: Feature[] = [
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
      "1階の屋外にウッドデッキを設置。アウトドアシャワーも備えているため、砂浜からそのままくつろげる設備が充実しています。",
    image: woodTerraceImg,
    alt: "1階ウッドデッキの様子",
  },
  {
    title: "室内アクティビティ（卓球・麻雀）",
    description:
      "天気に左右されず楽しめる卓球台・麻雀台を2階に完備。滞在中に無料でご利用いただけます。",
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
 * FeatureItem — 個別の特徴をエディトリアルスタイルで表示する（Issue #46）
 *
 * レイアウト:
 *   - スマホ: 写真上 + テキスト下（flex-col）
 *   - PC (sm〜): 写真とテキストを横並び（flex-row）
 *     - reversed=true のとき写真を右に配置（flex-row-reverse）で左右交互を実現
 *
 * 写真:
 *   - モバイル: aspect-[16/9]（シネマティック比率でダイナミックな印象を与える）
 *   - PC: sm:w-3/5 で横幅 60%（以前の 50% より大きく主役感を出す）
 *   - 写真の wrapper に rounded-lg + overflow-hidden を適用（箱ではなく写真に丸みをつける）
 *   - next/image の sizes でレスポンシブ画像配信を最適化
 *
 * 区切り:
 *   - article に border-b border-stone-200 を適用（最終項目は last:border-b-0 で非表示）
 *   - 箱（rounded-xl / shadow-sm / bg-stone-100）は使用しない
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
        // 箱（角丸・背景・影）を廃止してエディトリアルな区切りに変更（Issue #46）
        "flex",
        // アイテム間は border-b の仕切り線で区切る。最終項目は last:border-b-0 で非表示
        "border-b border-stone-200 dark:border-zinc-700 last:border-b-0",
        // 上下の余白をパディングで確保（箱がないため内部で余白を持つ）
        "py-10 sm:py-14",
        // スマホ: 縦積み（写真上・テキスト下）
        "flex-col",
        // SM以上: 横並び。reversed の場合は写真を右へ
        reversed ? "sm:flex-row-reverse" : "sm:flex-row",
        // 横並び時のギャップ
        "sm:gap-10",
      ].join(" ")}
    >
      {/* ── 写真エリア ── */}
      {/*
       * モバイル: aspect-[16/9] でシネマティック比率（Issue #46）
       * PC: sm:w-3/5 で 60% の幅を確保し写真を主役にする（Issue #46）
       *     sm:aspect-[4/3] で PC でも高さを固定確保する
       *     ※ sm:aspect-auto にするとテキスト高さに引きずられて写真が潰れるため
       * rounded-lg + overflow-hidden: 写真に丸みをつける（箱ではなく写真自体に適用）
       */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg sm:aspect-[4/3] sm:w-3/5">
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
           * スマホ（100vw）+ PC（60vw = 3/5 幅）（Issue #46 で 50vw → 60vw に更新）
           */
          sizes="(min-width: 640px) 60vw, 100vw"
        />
      </div>

      {/* ── テキストエリア ── */}
      {/*
       * justify-center: 写真と高さが合わないとき縦方向に中央揃え
       * sm:w-2/5: PC では残り 40% を占める（写真 60% + テキスト 40%）
       * モバイルでは写真の下に mt-6 で余白を設ける
       */}
      <div className="mt-6 flex flex-col justify-center gap-4 sm:mt-0 sm:w-2/5">
        {/*
         * h3: Section（h2）の下に置くことで見出し階層を維持する
         * text-xl に拡大して読み応えを持たせる（Issue #46）
         * docs/DESIGN.md §2.2 「階層を飛ばさない」
         */}
        <h3 className="text-xl font-semibold leading-snug text-stone-900 dark:text-zinc-50">
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
 * FeaturesSection — 特徴セクション（魅力）
 *
 * IA.md セクション順 3番目（Aboutの後・ Galleryの前）。
 * Section コンポーネントを使うことでセクション間の余白・見出しスタイルを統一する。
 */
export function FeaturesSection() {
  return (
    // variant="default"（白背景）: 写真の色が際立つようにする（Issue #46）
    <Section
      id={ANCHOR_IDS.features}
      title="魅力"
      lead="TATEYAMA BASE 北条が選ばれる4つのポイントをご紹介します。"
      variant="default"
    >
      {/*
       * エディトリアルアイテムリスト（Issue #46）
       * - 各アイテムが1行を占める縦積み
       * - gap は不要（各 article の py-10/py-14 パディングで間隔を確保）
       * - PC では各アイテム内部が左右2カラムになる（FeatureItem 内の flex-row）
       * - 偶数番目のアイテム（index が偶数）は写真を右側に反転（reversed=true）
       *   → 交互配置により単調さを避け、視線の流れを作る
       * - border-b で仕切り線を表示し、最終アイテムは last:border-b-0 で非表示
       */}
      <div className="flex flex-col">
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            {...feature}
            reversed={index % 2 === 0}
          />
        ))}
      </div>
    </Section>
  );
}
