/**
 * GallerySection — 体験ギャラリーセクション（Issue #105）
 *
 * 目的: 実際の宿泊者がSUP・海水浴・釣りなどを楽しんでいる様子を見せる「ソーシャルプルーフ」。
 *       FeaturesSection（設備・機能説明）とは役割が異なり、
 *       「実際にこう楽しんでいる人がいる」という共感・イメージ喚起で予約転換率を高める。
 *
 * レイアウト: マソンリーグリッド（CSS columns）
 *   - columns（CSS段組み）：写真の高さがバラバラでも隙間なく詰まるPinterest風のレイアウト。
 *     JavaScriptなしでCSSだけで実現できるシンプルな手法。
 *   - SP（スマホ）: 2列 / PC（lg以上）: 3列
 *   - break-inside-avoid: 写真が列をまたいで分割されないようにする
 *
 * 画像: imgs/gallery/ 以下（権利確認状況は docs/ASSETS.md 参照）
 * デザイン準拠: docs/DESIGN.md（余白・フォント・カラールール）
 * セマンティック: <section> > <h2> > <ul> > <li> で意味ある構造を維持
 * IA.md: FeaturesSection の直後（FacilitiesSection の前）に配置
 */

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
import sapImg from "../../imgs/gallery/sap-activities.jpg";
import sap2Img from "../../imgs/gallery/sap-activities2.jpg";
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
export function GallerySection() {
  return (
    // variant="tinted": 前後の白背景セクション（FeaturesSection/FacilitiesSection）と
    // 背景色でコントラストをつけ、「ギャラリーエリアに入った」ことを視覚的に伝える
    <Section
      title="TATEYAMA BASEでの過ごし方"
      lead="海・SUP・釣り—館山の自然をまるごと楽しむ"
      variant="tinted"
    >
      {/*
       * マソンリーグリッド（CSS columns = CSS段組み方式）
       *
       * columns-2: SP（スマホ）では2列に分割
       * lg:columns-3: PC（lg = 1024px以上）では3列に分割
       * gap-3 / lg:gap-4: 列間の隙間
       *
       * なぜ CSS columns を使うのか?
       * → Tailwind の grid は「行×列」で格子状に並べる方式のため、
       *   縦長・横長混在のときに隙間が生まれる。
       *   CSS columns は新聞の段組みと同じ原理で、写真を上から順に
       *   各列に詰めていくため、高さ違いでも隙間なく並ぶ（マソンリー効果）。
       */}
      <ul className="columns-2 gap-3 lg:columns-3 lg:gap-4">
        {GALLERY_PHOTOS.map((photo, index) => (
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
             *
             * SP 2列 → 各列 ≒ 画面幅の50%（50vw）
             * PC 3列 → 各列 ≒ 最大幅の33%（コンテナ幅の1/3）
             */}
            <Image
              src={photo.src}
              alt={photo.alt}
              // width / height は StaticImageData から自動取得（aspect ratio を維持したまま表示）
              className="w-full rounded-lg object-cover"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
