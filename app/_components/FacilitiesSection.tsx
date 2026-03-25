/**
 * FacilitiesSection — 設備セクション（フロア別写真付きレイアウト）
 *
 * 目的: 宿泊前に「何があるか」を場所（フロア）別に視覚的に伝える。
 *       Issue #36: アイコン箇条書き → 写真＋設備リストのフロアカードに刷新。
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
 * レイアウト:
 *   - スマホ: 写真上 + 設備リスト下（flex-col）
 *   - PC (sm〜): 写真左 + 設備リスト右（flex-row、2カラム）
 *   - 写真なしフロア（その他）: リストのみのシンプルカード
 *
 * 写真 (imgs/):
 *   - 屋外  → outdoor-shower.jpg
 *   - 1階   → first-floor.jpg
 *   - 2階   → second-floor.jpg
 *   - 屋上  → rooftop-terrace.jpg
 *   - その他 → 写真なし（設備のみ）
 *
 * デザイン準拠: docs/DESIGN.md（余白・フォント・stone カラールール）
 * セマンティック: <section> > <h2> > フロアカード内 <h3> で見出し階層を維持
 * IA.md: セクション順 5番目（特徴の後・アクセスの前）
 */

import Image, { type StaticImageData } from "next/image";

// ────────────────────────────────────────────────────────
// 写真のインポート（imgs/ 以下。next/image が自動で WebP 変換・最適化する）
// StaticImageData を使うと width / height が自動取得→ CLS（レイアウトズレ）防止
// ────────────────────────────────────────────────────────
import outdoorShowerImg from "../../imgs/outdoor-shower.jpg";
import firstFloorImg from "../../imgs/first-floor.jpg";
import secondFloorImg from "../../imgs/second-floor.jpg";
import rooftopTerraceImg from "../../imgs/rooftop-terrace.jpg";

import { ANCHOR_IDS } from "../_lib/anchors";
import { Section } from "./Section";

// ────────────────────────────────────────────────────────
// フロア別設備データ型
// ────────────────────────────────────────────────────────

type FloorFacility = {
  /** フロア名（h3 見出し） */
  floor: string;
  /**
   * 代表写真（next/image の StaticImageData）
   * undefined のフロアは写真エリアを非表示にする
   */
  image?: StaticImageData;
  /**
   * 画像の alt テキスト（アクセシビリティ必須）
   * 写真の内容を具体的に記述する（docs/DESIGN.md §3）
   */
  alt?: string;
  /** 設備一覧（docs/FACTS.md 確定情報のみ） */
  items: string[];
};

// ────────────────────────────────────────────────────────
// フロア別設備データ（docs/FACTS.md に基づく）
// ────────────────────────────────────────────────────────

const FLOOR_FACILITIES: FloorFacility[] = [
  {
    floor: "屋外",
    image: outdoorShowerImg,
    alt: "屋外シャワーの様子。砂浜帰りにそのまま使える屋外設備",
    // 根拠: docs/FACTS.md「駐車場・屋外設備」
    items: [
      "駐車スペース（1台）",
      "屋外シャワー",
      "EVコンセント（EV車2台まで）",
    ],
  },
  {
    floor: "1階",
    image: firstFloorImg,
    alt: "1階の室内。リビングスペースとウッドデッキが隣接している",
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
    image: secondFloorImg,
    alt: "2階の室内。卓球台・麻雀台が設置されたアクティビティフロア",
    // 根拠: docs/FACTS.md「2階」
    items: ["卓球台", "麻雀台", "ベッド（4台）", "トイレ"],
  },
  {
    floor: "屋上",
    image: rooftopTerraceImg,
    alt: "屋上テラスの様子。海と空を見渡せる開放的なスペース",
    // 根拠: docs/FACTS.md「屋上」
    items: ["屋上テラス"],
  },
  {
    floor: "その他",
    // 写真なし（該当する代表写真がないため。設備のみ表示）
    // 根拠: docs/FACTS.md「その他」
    items: ["無料Wi-Fi", "エアコン"],
  },
];

// ────────────────────────────────────────────────────────
// FloorCard コンポーネント
// 1フロア分の「写真＋設備リスト」をカード形式で表示する。
// h3 を使うことで Section（h2）→ FloorCard（h3）の見出し階層を維持。
// ────────────────────────────────────────────────────────

type FloorCardProps = {
  facility: FloorFacility;
};

/**
 * FloorCard — フロア別写真付きカード
 *
 * 写真ありフロア:
 *   - スマホ: 写真上（aspect-[4/3]）＋ リスト下（flex-col）
 *   - PC:     写真左（sm:w-2/5）＋ リスト右（flex-row）
 *
 * 写真なしフロア（その他）:
 *   - スマホ・PC 共通: リストのみのシンプルカード
 */
function FloorCard({ facility }: FloorCardProps) {
  const { floor, image, alt, items } = facility;
  const hasImage = image !== undefined && alt !== undefined;

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/60">
      {/*
       * 写真ありの場合: flex-col（モバイル）→ flex-row（PC）の2カラムレイアウト
       * 写真なしの場合: パディングあり・リストのみ表示
       */}
      <div className={hasImage ? "flex flex-col sm:flex-row" : "p-5"}>
        {/* ── 写真エリア ── */}
        {hasImage && (
          /*
           * モバイル: aspect-[4/3] でアスペクト比を固定（レイアウトズレ防止）
           * PC:       sm:aspect-auto + sm:w-2/5 + relative + Image fill で
           *           リストの高さに合わせて写真が伸縮する
           */
          <div className="relative aspect-[4/3] shrink-0 sm:aspect-auto sm:w-2/5">
            <Image
              src={image!}
              alt={alt!}
              fill
              className="object-cover"
              /*
               * sizes: ビューポート幅ごとの画像表示サイズを伝えることで
               * ブラウザが適切な解像度の画像を選択し、通信量を削減する
               * - スマホ（< sm = 640px）: 横幅 100vw（1カラム全幅）
               * - PC（>= sm）: コンテナの 2/5 ≒ 40vw
               */
              sizes="(min-width: 640px) 40vw, 100vw"
            />
          </div>
        )}

        {/* ── 設備リストエリア ── */}
        <div className={hasImage ? "flex flex-1 flex-col justify-center p-5" : ""}>
          {/* フロア見出し（h3）: Section の h2 の下に位置する第3レベル見出し */}
          <h3 className="mb-3 text-base font-semibold text-stone-900 dark:text-zinc-50">
            {floor}
          </h3>

          {/* 設備一覧: チェックマーク付き箇条書き */}
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-stone-700 dark:text-zinc-300"
              >
                {/* チェックマーク（装飾）— aria-hidden でスクリーンリーダーをスキップ */}
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-sky-500"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// FacilitiesSection（エクスポートするメインコンポーネント）
// ────────────────────────────────────────────────────────

/**
 * FacilitiesSection
 * フロア別（屋外・1階・2階・屋上・その他）に写真＋設備リストを表示する。
 *
 * レイアウト:
 *   - スマホ（< sm）: 1列（縦積み）
 *   - PC（>= sm）:   2列グリッド
 *   - 「その他」はグリッド内の最後に配置（写真なしカード）
 *
 * アクセシビリティ: id={ANCHOR_IDS.facilities} でヘッダーナビとページ内リンクに対応
 */
export function FacilitiesSection() {
  return (
    // Section コンポーネントが <section id="..."> + h2 + lead テキストを担当
    <Section
      id={ANCHOR_IDS.facilities}
      title="施設・設備"
      lead="1棟まるごとお使いいただける全フロアの設備をご確認ください。アメニティ（シャンプー等）は準備中です。"
    >
      {/*
       * フロア別カードのグリッドレイアウト
       * - スマホ: 1列（縦積み）
       * - PC（sm〜）: 2列
       * gap-6 でカード間に適切な余白（DESIGN.md 準拠）
       */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {FLOOR_FACILITIES.map((facility) => (
          <FloorCard key={facility.floor} facility={facility} />
        ))}
      </div>
    </Section>
  );
}
