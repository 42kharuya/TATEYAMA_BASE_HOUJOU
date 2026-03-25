/**
 * FacilitiesSection — 設備セクション（フロア別タブ切り替えレイアウト）
 *
 * 目的: 宿泊前に「何があるか」を場所（フロア）別に視覚的に伝える。
 *       Issue #47: グリッドレイアウト → フロア別タブ切り替えに刷新。
 *       Issue #36: アイコン箇条書き → 写真＋設備リストに刷新（継続）。
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
 *   - タブ切り替えで写真（大）＋設備リストを更新
 *   - Wi-Fi・エアコンバッジはタブエリア外（下部）に常時表示
 *   - スマホではタブが横スクロール可能
 *
 * 写真 (imgs/):
 *   - 屋外  → outdoor-shower.jpg
 *   - 1階   → first-floor.jpg
 *   - 2階   → second-floor.jpg
 *   - 屋上  → rooftop-terrace.jpg
 *
 * デザイン準拠: docs/DESIGN.md（余白・フォント・stone カラールール）
 * セマンティック: <section> > <h2> > role="tablist" / role="tabpanel" で構造化
 * IA.md: セクション順 5番目（特徴の後・アクセスの前）
 * ARIA: role="tablist" + role="tab" + aria-selected + aria-controls / role="tabpanel"
 */

"use client";

// useState: React が提供するフック。コンポーネント内に「状態（State）」を持たせる機能。
// ここでは「どのタブが選択中か」を記憶するために使う。
import { useState } from "react";
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
  /** フロア名（タブラベル・h3 見出し） */
  floor: string;
  /**
   * タブ・パネルの id 属性に使う安全な識別子（ASCII のみ）
   * aria-controls / aria-labelledby の連携に必須
   */
  id: string;
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
    id: "first-floor",
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
    id: "second-floor",
    image: secondFloorImg,
    alt: "2階の室内。卓球台・麻雀台が設置されたアクティビティフロア",
    // 根拠: docs/FACTS.md「2階」（誤記修正済み: 麻雀台=椅子付き、卓球台=ラケット・ボール付き）
    items: ["卓球台（ラケット・ボール付き）", "麻雀台（椅子付き）", "ベッド（4台）", "トイレ"],
    note: "道具はすべて揃っているので、手ぶらでお楽しみいただけます。",
  },
  {
    floor: "屋上",
    id: "rooftop",
    image: rooftopTerraceImg,
    alt: "屋上テラスの様子。海と空を見渡せる開放的なスペース",
    // 根拠: docs/FACTS.md「屋上」
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
  // useState<string> の型引数 <string> は「状態の型は文字列」と TypeScript に伝えるもの
  const [activeId, setActiveId] = useState<string>(FLOOR_FACILITIES[0].id);

  // 現在アクティブなフロアのデータを配列から検索する
  // find() は条件に合う最初の要素を返す。! は「必ず値がある」と TypeScript に伝える（非 null アサーション）
  const activeFacility = FLOOR_FACILITIES.find((f) => f.id === activeId)!;

  return (
    <Section
      id={ANCHOR_IDS.facilities}
      title="施設・設備"
      lead="1棟まるごとお使いいただける全フロアの設備をご確認ください。アメニティ（シャンプー等）は準備中です。"
    >
      {/*
       * ────────────────────────────────────────────────
       * タブバー
       * overflow-x-auto: コンテンツがはみ出した場合に横スクロールを有効化（スマホ対応）
       * role="tablist": スクリーンリーダーに「タブの集まり」と伝える ARIA ロール
       * aria-label: タブリスト全体の目的をスクリーンリーダーに伝えるラベル
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
            /*
             * role="tab": このボタンがタブであることをスクリーンリーダーに伝える
             * aria-selected: 現在選択中かどうかを true/false で示す
             * aria-controls: 対応する tabpanel の id を指定（構造的な紐付け）
             * tabIndex={0}: すべてのタブを Tab キーでフォーカス可能にする
             *   → AC「キーボード（Tab・Enter）でタブ操作できる」を満たすため
             */
            <button
              key={facility.id}
              role="tab"
              id={`tab-${facility.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${facility.id}`}
              tabIndex={0}
              onClick={() => setActiveId(facility.id)}
              onKeyDown={(e) => {
                // Enter キーでもタブ切り替えを起動（button は通常 Space/Enter で click が発火するが明示的に保証）
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveId(facility.id);
                }
              }}
              className={[
                // 共通スタイル: パディング・フォント・ホワイトスペース制御（改行禁止）
                "shrink-0 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2",
                // アクティブ: 下線ボーダー + テキスト色変更
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
       * タブパネル（アクティブなフロアの写真＋設備リスト）
       * role="tabpanel": スクリーンリーダーに「タブの内容エリア」と伝える
       * aria-labelledby: 対応するタブボタンの id を指定（ラベルを共有）
       * key={activeFacility.id}: タブ切り替え時に DOM を再生成してアニメーション回避
       * ────────────────────────────────────────────────
       */}
      <div
        role="tabpanel"
        id={`panel-${activeFacility.id}`}
        aria-labelledby={`tab-${activeFacility.id}`}
        key={activeFacility.id}
        className="overflow-hidden rounded-b-xl border border-t-0 border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/60"
      >
        {/* 写真エリア（aspect-[16/9] で大きく表示） */}
        {activeFacility.image && activeFacility.alt && (
          /*
           * relative: 内側の Image（fill）の基準点になる
           * aspect-[16/9]: 幅:高さ = 16:9 の比率を維持（レイアウトズレ防止）
           * overflow-hidden: 角丸からはみ出す画像をクリッピング
           */
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={activeFacility.image}
              alt={activeFacility.alt}
              fill
              className="object-cover"
              /*
               * sizes: ビューポート幅ごとの画像表示サイズをブラウザに伝える。
               * これにより適切な解像度の画像が選択され、通信量を削減できる。
               * - PC（>= 768px）: コンテナ幅≒700px
               * - スマホ（< 768px）: ビューポート幅 100%
               */
              sizes="(min-width: 768px) 700px, 100vw"
              // 初期表示タブ（屋外）の画像は優先ロード（LCP 改善）
              priority={activeFacility.id === FLOOR_FACILITIES[0].id}
            />
          </div>
        )}

        {/* 設備リストエリア */}
        <div className="p-5">
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
