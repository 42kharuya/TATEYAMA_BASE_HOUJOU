/**
 * GallerySection — 体験ギャラリーセクション（Issue #105）
 *
 * 目的: 実際の宿泊者がSUP・海水浴・釣りなどを楽しんでいる様子を見せる「ソーシャルプルーフ」。
 *       FeaturesSection（設備・機能説明）とは役割が異なり、
 *       「実際にこう楽しんでいる人がいる」という共感・イメージ喚起で予約転換率を高める。
 *
 * レイアウト: マソンリーグリッド（CSS columns）
 *   - columns（CSS段組み）：写真の高さがバラバラでも隙間なく詰まるPinterest風のレイアウト。
 *   - SP（スマホ）: 2列 / PC（lg以上）: 3列
 *   - break-inside-avoid: 写真が列をまたいで分割されないようにする
 *
 * 折りたたみ: 初期表示は INITIAL_COUNT 枚。「もっと見る」ボタンで全枚数を展開。
 *   - "use client": useState を使うため Client Component として宣言する必要がある。
 *     Next.js App Router では、インタラクション（ボタン操作・状態管理）を持つ
 *     コンポーネントには必ずこのディレクティブが必要。
 *
 * 画像: imgs/gallery/ 以下（権利確認状況は docs/ASSETS.md 参照）
 * デザイン準拠: docs/DESIGN.md（余白・フォント・カラールール）
 * セマンティック: <section> > <h2> > <ul> > <li> で意味ある構造を維持
 * IA.md: FeaturesSection の直後（FacilitiesSection の前）に配置
 */

// "use client": このコンポーネントはブラウザ側で動く「クライアントコンポーネント」として宣言する。
// useState（ボタンの押下状態管理）を使うために必須。
// Server Component（デフォルト）では useState などのReact フックは使えない。
"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";

// ────────────────────────────────────────────────────────
// 写真のインポート（imgs/gallery/ 以下）
// next/image の StaticImageData を使うと width/height が自動取得され
// CLS（画像読み込み時のレイアウトズレ）を防げる
// ────────────────────────────────────────────────────────
import chatImg from "../../imgs/gallery/chat.jpg";
import fishingImg from "../../imgs/gallery/fishing-activities.jpg";
import fishing2Img from "../../imgs/gallery/fishing-activities2.jpg";
import sunsetImg from "../../imgs/gallery/houjou-coast-sunset.jpg";
import sunset2Img from "../../imgs/gallery/houjou-coast-sunset2.jpg";
import swimmingImg from "../../imgs/gallery/houjou-coast-swimming.jpg";
import livingMealImg from "../../imgs/gallery/living-meal.png";
import mahjongImg from "../../imgs/gallery/mah-jongg-activities.jpg";
import rooftopImg from "../../imgs/gallery/rooftop-scenery.png";
import sapImg from "../../imgs/gallery/sup-activities.jpg";
import sap2Img from "../../imgs/gallery/sup-activities2.jpg";
import tableTennisImg from "../../imgs/gallery/table-tennis-activities.jpg";
import walkingImg from "../../imgs/gallery/walking-to-the-sea.png";
import wetSuitImg from "../../imgs/gallery/wet-suit-wearing.jpg";

import { Section } from "./Section";

// ────────────────────────────────────────────────────────
// ギャラリー写真の型定義
// ────────────────────────────────────────────────────────
type GalleryPhoto = {
  /** next/image に渡す画像データ（StaticImageData は自動でWebP変換される） */
  src: StaticImageData;
  /**
   * alt テキスト: スクリーンリーダー（視覚障害者向け読み上げ）や
   * 画像が読み込めないときに表示される説明文。
   * 具体的な内容を書くことがアクセシビリティの基本ルール（docs/DESIGN.md §3）
   */
  alt: string;
};

// ────────────────────────────────────────────────────────
// ギャラリー写真リスト
// 表示順は「海・外アクティビティ → 夕日・景色 → 室内・食事」の流れで
// ページの「体験イメージ」が自然に伝わるよう並べる
// ────────────────────────────────────────────────────────
const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    src: sapImg,
    alt: "北条海岸でSUPを楽しむ宿泊者の様子",
  },
  {
    src: swimmingImg,
    alt: "北条海岸で海水浴を楽しむ宿泊者たちの様子",
  },
  {
    src: sap2Img,
    alt: "海上でSUPを漕ぐ宿泊者たちの様子",
  },
  {
    src: fishingImg,
    alt: "北条海岸で釣りを楽しむ宿泊者の様子",
  },
  {
    src: sunsetImg,
    alt: "北条海岸から望む夕日の景色",
  },
  {
    src: fishing2Img,
    alt: "釣りを楽しむ宿泊者たちの様子",
  },
  {
    src: walkingImg,
    alt: "別荘から海へ向かう宿泊者の様子",
  },
  {
    src: sunset2Img,
    alt: "北条海岸の美しい夕景",
  },
  {
    src: wetSuitImg,
    alt: "ウェットスーツを着用して海アクティビティの準備をする様子",
  },
  {
    src: rooftopImg,
    alt: "屋上テラスから望む館山の景色",
  },
  {
    src: chatImg,
    alt: "館内でくつろぐ宿泊者たちの様子",
  },
  {
    src: livingMealImg,
    alt: "館内で食事を楽しむ宿泊者たちの様子",
  },
  {
    src: mahjongImg,
    alt: "2階麻雀台で麻雀を楽しむ宿泊者の様子",
  },
  {
    src: tableTennisImg,
    alt: "2階卓球台で卓球を楽しむ宿泊者たちの様子",
  },
];

// ────────────────────────────────────────────────────────
// GallerySection コンポーネント
// ────────────────────────────────────────────────────────

/**
 * 初期表示枚数
 * SP 2列 × 3行 = 6枚 がちょうど画面に収まりスッキリ見える基準。
 * PC 3列でも 6 ÷ 3 = 2行で綺麗に揃う。
 */
const INITIAL_COUNT = 6;

export function GallerySection() {
  /**
   * isExpanded: ギャラリーが展開済みかどうかを管理する状態（State）
   * useState(false) → 最初は折りたたまれた状態（false = 全表示ではない）
   * ボタンを押すと true/false が切り替わり、表示枚数が変わる
   */
  const [isExpanded, setIsExpanded] = useState(false);

  // isExpanded が false なら最初の INITIAL_COUNT 枚だけ、true なら全枚数を表示
  const visiblePhotos = isExpanded
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.slice(0, INITIAL_COUNT);

  // 残りの枚数（「あと○枚」の表示に使う）
  const remainingCount = GALLERY_PHOTOS.length - INITIAL_COUNT;

  return (
    // variant="tinted": 前後の白背景セクション（FeaturesSection/FacilitiesSection）と
    // 背景色でコントラストをつけ、「ギャラリーエリアに入った」ことを視覚的に伝える
    <Section      id="gallery"      title="当別荘での過ごし方"
      lead="海・SUP・釣り—館山の自然をまるごと楽しむ"
      variant="tinted"
    >
      {/*
       * マソンリーグリッド（CSS columns = CSS段組み方式）
       *
       * columns-2: SP では2列 / lg:columns-3: PC では3列
       * gap-3 / lg:gap-4: 列間の隙間
       */}
      <ul className="columns-2 gap-3 lg:columns-3 lg:gap-4">
        {visiblePhotos.map((photo, index) => (
          /*
           * break-inside-avoid: 1枚の写真が列の境界をまたいで
           * 上下に分割されないようにするCSS。columns 使用時は必須。
           *
           * mb-3 / lg:mb-4: 写真間の縦方向の隙間（列内の間隔）
           */
          <li key={index} className="mb-3 break-inside-avoid lg:mb-4">
            {/*
             * next/image: Next.js の画像最適化コンポーネント
             *   - 自動で WebP 形式に変換（ファイルサイズ削減）
             *   - 遅延読み込み（Lazy Loading）: 画面外の画像は後から読む
             *   - sizes: 実際の表示幅のヒントをブラウザに伝えて最適なサイズを配信
             */}
            <Image
              src={photo.src}
              alt={photo.alt}
              className="w-full rounded-lg object-cover"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </li>
        ))}
      </ul>

      {/*
       * 展開・折りたたみボタン
       * 全枚数が INITIAL_COUNT 以下なら不要なので表示しない
       */}
      {GALLERY_PHOTOS.length > INITIAL_COUNT && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            /*
             * onClick: ボタンを押すたびに isExpanded を反転させる
             * (prev) => !prev: 現在の値（prev）を受け取って逆にする関数
             *
             * スタイル解説:
             *   rounded-full: 角を完全に丸くしてピル型ボタンにする
             *   border border-sky-500: ブランドカラー（空色）の枠線
             *   text-sky-700: ブランドカラーの濃い青テキスト
             *   hover:bg-sky-50: ホバー時に薄い青背景で押せることを伝える
             *   transition: 背景色変化をなめらかにする
             */
            className="rounded-full border border-sky-500 px-6 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50 dark:border-sky-400 dark:text-sky-300 dark:hover:bg-sky-950"
          >
            {isExpanded
              ? "折りたたむ"
              : `もっと見る`}
          </button>
        </div>
      )}
    </Section>
  );
}
