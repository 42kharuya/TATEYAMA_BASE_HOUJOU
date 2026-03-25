/**
 * FacilitiesSection — 設備セクション（フロア別タブ切り替え＋写真ギャラリーレイアウト）
 *
 * 目的: 宿泊前に「何があるか」を場所（フロア）別に視覚的に伝える。
 *       Issue #47: グリッドレイアウト → フロア別タブ切り替えに刷新。
 *       Issue #36: アイコン箇条書き → 写真＋設備リストに刷新（継続）。
 *       追加改善: 各フロアで複数写真をサムネイルギャラリー表示に対応。
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
 *   - タブ（屋外 / 1階 / 2階 / 屋上）を横並びで表示
 *   - タブパネル内: 左 = メイン写真(aspect-[4/3]) + サムネイル行、右 = 設備リスト（md〜 2カラム）
 *   - Wi-Fi・エアコンバッジはタブエリア外（下部）に常時表示
 *   - スマホではタブが横スクロール可能、パネルは縦積み
 *
 * デザイン準拠: docs/DESIGN.md（余白・フォント・stone カラールール）
 * セマンティック: <section> > <h2> > role="tablist" / role="tabpanel" で構造化
 * IA.md: セクション順 5番目（特徴の後・アクセスの前）
 * ARIA: role="tablist" + role="tab" + aria-selected + aria-controls / role="tabpanel"
 */

"use client";

// useState: React が提供するフック。コンポーネント内に「状態（State）」を持たせる機能。
// ここでは「どのタブが選択中か」と「どのサムネイルが選択中か」を記憶するために使う。
import { useState } from "react";
import Image, { type StaticImageData } from "next/image";

// ────────────────────────────────────────────────────────
// 写真のインポート（imgs/ 以下。next/image が自動で WebP 変換・最適化する）
// StaticImageData を使うと width / height が自動取得→ CLS（レイアウトズレ）防止
// ────────────────────────────────────────────────────────
// 屋外
import woodTerraceImg from "../../imgs/wood-terrace.jpg";
import outdoorShowerImg from "../../imgs/outdoor-shower.jpg";
// 1階
import firstFloorImg from "../../imgs/first-floor.jpg";
import livingImg from "../../imgs/living.jpg";
import bedImg from "../../imgs/bed.jpg";
import bathRoomImg from "../../imgs/bath-room.jpg";
import firstFloorToiletImg from "../../imgs/first-floor-toilet.jpg";
// 2階
import secondFloorImg from "../../imgs/second-floor.jpg";
import tableTennisImg from "../../imgs/table-tennis.jpg";
import mahJonggImg from "../../imgs/mah-jongg.jpg";
import secondFloorToiletImg from "../../imgs/second-floor-toilet.jpg";
// 屋上
import rooftopTerraceImg from "../../imgs/rooftop-terrace.jpg";

import { ANCHOR_IDS } from "../_lib/anchors";
import { Section } from "./Section";

// ────────────────────────────────────────────────────────
// フロア別設備データ型
// ────────────────────────────────────────────────────────

/** 1枚の写真データ（src + alt のペア） */
type FloorPhoto = {
  src: StaticImageData;
  /** 画像の内容を具体的に記述（スクリーンリーダー向け） */
  alt: string;
};

type FloorFacility = {
  /** フロア名（タブラベル・h3 見出し） */
  floor: string;
  /**
   * タブ・パネルの id 属性に使う安全な識別子（ASCII のみ）
   * aria-controls / aria-labelledby の連携に必須
   */
  id: string;
  /**
   * フロアの写真一覧（複数枚対応）
   * 最初の要素がメイン表示、残りはサムネイルとして選択可能
   */
  photos: FloorPhoto[];
  /** 設備一覧（docs/FACTS.md 確定情報のみ） */
  items: string[];
  /** フロア補足テキスト（「手ぶらOK」など）— 表示する場合のみ設定 */
  note?: string;
};

// ────────────────────────────────────────────────────────
// フロア別設備データ（docs/FACTS.md に基づく）
// ────────────────────────────────────────────────────────

const FLOOR_FACILITIES: FloorFacility[] = [
  {
    floor: "屋外",
    id: "outdoor",
    // 根拠: docs/FACTS.md「駐車場・屋外設備」
    photos: [
      { src: woodTerraceImg,    alt: "ウッドテラスの様子。海風を感じながらくつろげる屋外スペース" },
      { src: outdoorShowerImg,  alt: "屋外シャワーの様子。砂浜帰りにそのまま使える設備" },
    ],
    items: [
      "駐車スペース（1台）",
      "屋外シャワー",
      "EVコンセント（EV車2台まで）",
    ],
  },
  {
    floor: "1階",
    id: "first-floor",
    // 根拠: docs/FACTS.md「1階（ウッドデッキ付き）」
    photos: [
      { src: firstFloorImg,        alt: "1階の室内全景。ウッドデッキに続くリビングスペース" },
      { src: livingImg,            alt: "1階リビング。大型テレビとくつろぎのソファ" },
      { src: bedImg,               alt: "1階ベッドルーム。ベッド4台を完備" },
      { src: bathRoomImg,          alt: "1階バスルーム。清潔感のある浴室" },
      { src: firstFloorToiletImg,  alt: "1階トイレ" },
    ],
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
    id: "second-floor",
    // 根拠: docs/FACTS.md「2階」（誤記修正済み: 麻雀台=椅子付き、卓球台=ラケット・ボール付き）
    photos: [
      { src: secondFloorImg,        alt: "2階の室内全景。アクティビティを楽しめるフロア" },
      { src: tableTennisImg,        alt: "卓球台。ラケット・ボール付きで手ぶらで楽しめる" },
      { src: mahJonggImg,           alt: "麻雀台。椅子付きで本格的な対局ができる" },
      { src: bedImg,                alt: "2階ベッドルーム。ベッド4台を完備" },
      { src: secondFloorToiletImg,  alt: "2階トイレ" },
    ],
    items: ["卓球台（ラケット・ボール付き）", "麻雀台（椅子付き）", "ベッド（4台）", "トイレ"],
    note: "道具はすべて揃っているので、手ぶらでお楽しみいただけます。",
  },
  {
    floor: "屋上",
    id: "rooftop",
    // 根拠: docs/FACTS.md「屋上」
    photos: [
      { src: rooftopTerraceImg, alt: "屋上テラスの様子。海と空を見渡せる開放的なスペース" },
    ],
    items: ["屋上テラス"],
  },
  // 「その他」（Wi-Fi・エアコン）は全フロア共通設備のため、
  // カードではなくセクション下部のバッジとして表示する（FacilitiesSection 側で実装）
];

// ────────────────────────────────────────────────────────
// FacilitiesSection（エクスポートするメインコンポーネント）
// ────────────────────────────────────────────────────────

/**
 * FacilitiesSection
 * フロア別タブ（屋外・1階・2階・屋上）で写真＋設備リストを切り替えて表示する。
 *
 * アクセシビリティ（WAI-ARIA Tabs パターン準拠）:
 *   - role="tablist" でタブグループをラベリング
 *   - role="tab" + aria-selected + aria-controls で各タブを識別
 *   - role="tabpanel" + aria-labelledby でパネルとタブを紐付け
 *   - キーボード: Tab でタブにフォーカス、Enter でタブ切り替え
 */
export function FacilitiesSection() {
  // アクティブタブの id を管理する State（初期値: 屋外タブ）
  const [activeId, setActiveId] = useState<string>(FLOOR_FACILITIES[0].id);

  // 選択中のサムネイルインデックスを管理する State（初期値: 0番目 = メイン写真）
  // number 型: 0, 1, 2... と写真配列の添字を保持する
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // 現在アクティブなフロアのデータを配列から検索する
  const activeFacility = FLOOR_FACILITIES.find((f) => f.id === activeId)!;

  // タブを切り替えるときに写真インデックスも 0 にリセットする
  const handleTabChange = (id: string) => {
    setActiveId(id);
    setActivePhotoIndex(0);
  };

  // 現在表示中の写真（メイン表示用）
  const activePhoto = activeFacility.photos[activePhotoIndex];

  return (
    <Section
      id={ANCHOR_IDS.facilities}
      title="施設・設備"
      lead="1棟まるごとお使いいただける全フロアの設備をご確認ください。アメニティ（シャンプー等）は準備中です。"
    >
      {/*
       * ────────────────────────────────────────────────
       * タブバー
       * overflow-x-auto: スマホで横スクロールを有効化
       * role="tablist": スクリーンリーダーに「タブの集まり」と伝える ARIA ロール
       * ────────────────────────────────────────────────
       */}
      <div
        role="tablist"
        aria-label="フロアを選択"
        className="flex overflow-x-auto border-b border-stone-200 dark:border-zinc-700"
      >
        {FLOOR_FACILITIES.map((facility) => {
          const isActive = facility.id === activeId;
          return (
            <button
              key={facility.id}
              role="tab"
              id={`tab-${facility.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${facility.id}`}
              tabIndex={0}
              onClick={() => handleTabChange(facility.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTabChange(facility.id);
                }
              }}
              className={[
                "shrink-0 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2",
                isActive
                  ? "border-b-2 border-sky-500 text-sky-600 dark:text-sky-400"
                  : "text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200",
              ].join(" ")}
            >
              {facility.floor}
            </button>
          );
        })}
      </div>

      {/*
       * ────────────────────────────────────────────────
       * タブパネル
       * role="tabpanel"  : スクリーンリーダーに「タブの内容エリア」と伝える
       * aria-labelledby  : 対応するタブボタンの id を指定（ラベルを共有）
       * key={activeFacility.id}: タブ切り替え時に DOM を再生成して状態をリセット
       *
       * 内部レイアウト:
       *   スマホ (< md): 写真ギャラリー上 → 設備リスト下（縦積み）
       *   PC    (>= md): 左 = 写真ギャラリー、右 = 設備リスト（2カラム）
       * ────────────────────────────────────────────────
       */}
      <div
        role="tabpanel"
        id={`panel-${activeFacility.id}`}
        aria-labelledby={`tab-${activeFacility.id}`}
        key={activeFacility.id}
        className="overflow-hidden rounded-b-xl border border-t-0 border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/60"
      >
        <div className="flex flex-col md:flex-row">

          {/* ── 左カラム: 写真ギャラリー ── */}
          <div className="shrink-0 md:w-1/2">

            {/*
             * メイン写真
             * aspect-[4/3]: 幅:高さ = 4:3 の比率（16:9 より縦に余裕があり設備リストと並べやすい）
             * relative + fill: 親の aspect-ratio に合わせて Image を引き伸ばす
             */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                fill
                className="object-cover transition-opacity duration-200"
                /*
                 * sizes: ビューポート幅に応じた適切な解像度の画像を選択させる
                 * - PC（>= 768px）: 左カラム = コンテナの 1/2 ≒ 350px
                 * - スマホ（< 768px）: 全幅 = 100vw
                 */
                sizes="(min-width: 768px) 50vw, 100vw"
                // 初期表示タブ・初期写真は優先ロード（LCP 改善）
                priority={activeFacility.id === FLOOR_FACILITIES[0].id && activePhotoIndex === 0}
              />
            </div>

            {/*
             * サムネイル行
             * 写真が2枚以上あるフロアだけ表示する（1枚のみの屋上では非表示）
             * overflow-x-auto: サムネイルが多い場合に横スクロール可能にする
             */}
            {activeFacility.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-2">
                {activeFacility.photos.map((photo, index) => {
                  const isSelected = index === activePhotoIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => setActivePhotoIndex(index)}
                      aria-label={`写真 ${index + 1}: ${photo.alt}`}
                      aria-pressed={isSelected}
                      className={[
                        // サムネイルのサイズ・形状・フォーカスリング
                        "relative aspect-square w-14 shrink-0 overflow-hidden rounded focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-1",
                        // 選択中: sky のリング、非選択: 半透明
                        isSelected
                          ? "ring-2 ring-sky-500"
                          : "opacity-60 hover:opacity-100 transition-opacity",
                      ].join(" ")}
                    >
                      <Image
                        src={photo.src}
                        alt=""
                        fill
                        // aria-label でラベルを付けているのでサムネイル Image は空 alt で OK
                        aria-hidden="true"
                        className="object-cover"
                        sizes="56px"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 右カラム: 設備リスト ── */}
          <div className="flex flex-col justify-center p-5 md:flex-1">
            {/* フロア見出し（h3）: Section の h2 の下に位置する第3レベル見出し */}
            <h3 className="mb-3 text-base font-semibold text-stone-900 dark:text-zinc-50">
              {activeFacility.floor} の設備
            </h3>

            {/* 設備一覧: チェックマーク付き箇条書き */}
            <ul className="space-y-1.5">
              {activeFacility.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-stone-700 dark:text-zinc-300"
                >
                  {/* チェックマーク（装飾）— aria-hidden でスクリーンリーダーをスキップ */}
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-sky-500">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* 補足テキスト（手ぶらOKなど）— note がある場合のみ表示 */}
            {activeFacility.note && (
              <p className="mt-3 text-xs italic text-stone-500 dark:text-zinc-400">
                💡 {activeFacility.note}
              </p>
            )}
          </div>

        </div>
      </div>

      {/*
       * 全フロア共通設備バッジ（タブエリア外・常時表示）
       * Wi-Fi・エアコンはすべての部屋に完備しているため、
       * フロアタブとは分けてバッジ形式で常時表示する（誤解防止）
       */}
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          🛜 全室 無料Wi-Fi
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          ❄️ 全室エアコン完備
        </span>
      </div>
    </Section>
  );
}
