/**
 * GallerySection — カテゴリ別ギャラリーコンポーネント
 *
 * 役割: 写真をカテゴリ別に並べ、タップで Lightbox を開いて滞在イメージを補強する。
 *
 * 設計方針（docs/DESIGN.md 3.3 / 8.5 より）:
 *   - サムネイルは同比率（aspect-[4/3]）で揃える（ガタつきを避ける）
 *   - カテゴリ（h3）でグループ化して情報を整理する
 *   - 画像の alt は docs/ASSETS.md の案をベースに付与する
 *
 * alt 付与ルール（docs/DESIGN.md 3.4 より）:
 *   - 意味のある写真は内容が分かる短い説明を書く
 *   - 装飾目的のみの画像は空文字 "" にして読み上げをスキップ
 */

"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

// ---- 画像の import ----
// next/image が静的に解析できるよう個別にインポートする
import bathRoomImg from "../../imgs/bath-room.jpg";
import bedImg from "../../imgs/bed.jpg";
import firstFloorToiletImg from "../../imgs/first-floor-toilet.jpg";
import firstFloorImg from "../../imgs/first-floor.jpg";
import lifeJacketImg from "../../imgs/life-jacket.jpg";
import livingImg from "../../imgs/living.jpg";
import mahJonggImg from "../../imgs/mah-jongg.jpg";
import outdoorShowerImg from "../../imgs/outdoor-shower.jpg";
import rooftopTerraceImg from "../../imgs/rooftop-terrace.jpg";
import sapImg from "../../imgs/sap.jpg";
import secondFloorToiletImg from "../../imgs/second-floor-toilet.jpg";
import secondFloorImg from "../../imgs/second-floor.jpg";
import tableTennisImg from "../../imgs/table-tennis.jpg";
import wetSuitImg from "../../imgs/wet-suit.jpg";
import woodTerraceImg from "../../imgs/wood-terrace.jpg";
import { type LightboxImage, Lightbox } from "./Lightbox";

// ----------------------------------------------------------------
// カテゴリ定義
// ----------------------------------------------------------------

/**
 * ギャラリーの 1 カテゴリ
 * title: カテゴリ名（h3 で表示する）
 * images: そのカテゴリの画像一覧
 */
type GalleryCategory = {
  title: string;
  images: LightboxImage[];
};

/** カテゴリ別の画像データ（docs/ASSETS.md の alt 案をベースに設定）*/
const GALLERY_CATEGORIES: GalleryCategory[] = [
  {
    title: "室内",
    images: [
      { src: firstFloorImg, alt: "1階の室内の様子" },
      { src: livingImg, alt: "リビングの様子" },
      { src: bedImg, alt: "ベッドの様子" },
      { src: secondFloorImg, alt: "2階の室内の様子" },
    ],
  },
  {
    title: "テラス・屋外",
    images: [
      { src: woodTerraceImg, alt: "1階ウッドデッキの様子" },
      { src: rooftopTerraceImg, alt: "屋上テラスの様子" },
      { src: outdoorShowerImg, alt: "屋外シャワーの様子" },
    ],
  },
  {
    title: "水まわり",
    images: [
      { src: bathRoomImg, alt: "バスルームの様子" },
      { src: firstFloorToiletImg, alt: "1階トイレの様子" },
      { src: secondFloorToiletImg, alt: "2階トイレの様子" },
    ],
  },
  {
    title: "アクティビティ",
    images: [
      { src: tableTennisImg, alt: "卓球台の様子" },
      { src: mahJonggImg, alt: "麻雀台の様子" },
    ],
  },
  {
    title: "レンタル用品",
    images: [
      { src: sapImg, alt: "サップ（レンタル用品）の様子" },
      { src: wetSuitImg, alt: "ウェットスーツ（レンタル用品）の様子" },
      { src: lifeJacketImg, alt: "ライフジャケット（レンタル用品）の様子" },
    ],
  },
];

/**
 * カテゴリをまたいだ「全画像のフラット配列」を生成する。
 * Lightbox に渡す globalIndex（全体通し番号）の計算に使う。
 *
 * 例: カテゴリ A に 4 枚, カテゴリ B に 3 枚ある場合
 *   → [A[0], A[1], A[2], A[3], B[0], B[1], B[2]] の順番で配列を作る
 */
const ALL_IMAGES: LightboxImage[] = GALLERY_CATEGORIES.flatMap(
  (cat) => cat.images,
);

// ----------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------

export function GallerySection() {
  /**
   * Lightbox で表示中の画像インデックス（全体通し番号）
   * null = 非表示
   */
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /**
   * 「開いたときのサムネイルボタン」への参照
   * Lightbox を閉じたときにここへフォーカスを戻す（フォーカス復帰）
   */
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- Lightbox を開く ----
  // クリックされたサムネイルのボタン要素と全体インデックスを保存する
  const openLightbox = useCallback(
    (globalIndex: number, buttonEl: HTMLButtonElement) => {
      triggerRef.current = buttonEl;
      setLightboxIndex(globalIndex);
    },
    [],
  );

  // ---- Lightbox を閉じる ----
  // 非表示にしてから、開いた元ボタンにフォーカスを戻す（フォーカス復帰）
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  // ---- 次へ ----
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || prev >= ALL_IMAGES.length - 1) return prev;
      return prev + 1;
    });
  }, []);

  // ---- 前へ ----
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  // ---- カテゴリごとの先頭グローバルインデックスを事前計算 ----
  // 例: [0, 4, 7, 10, 12] のようなオフセット配列を作る
  const categoryOffsets = GALLERY_CATEGORIES.reduce<number[]>(
    (acc, cat, idx) => {
      if (idx === 0) return [0];
      return [...acc, acc[idx - 1] + GALLERY_CATEGORIES[idx - 1].images.length];
    },
    [],
  );

  return (
    <>
      {/* ---- セクション全体 ---- */}
      <section id="gallery" className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
          {/* ---- セクションヘッダー ---- */}
          <header className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
              ギャラリー
            </h2>
            <p className="max-w-3xl text-base leading-7 text-stone-600">
              施設内外の写真でご滞在のイメージをご確認ください。写真をタップすると拡大表示します。
            </p>
          </header>

          {/* ---- カテゴリ別グリッド ---- */}
          {GALLERY_CATEGORIES.map((category, catIdx) => (
            <div key={category.title} className="space-y-4">
              {/*
               * カテゴリ見出し（h3）
               * h2（セクション）→ h3（カテゴリ）で階層を崩さない（docs/DESIGN.md 2.2 より）
               */}
              <h3 className="text-xl font-semibold text-stone-900">
                {category.title}
              </h3>

              {/*
               * サムネイルグリッド
               * - スマホ: 2列
               * - sm 以上: 3〜4列
               */}
              <ul
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4"
                role="list"
                aria-label={`${category.title}の写真`}
              >
                {category.images.map((image, imgIdx) => {
                  // カテゴリ内インデックス → 全体インデックス に変換
                  const globalIndex = categoryOffsets[catIdx] + imgIdx;

                  return (
                    <li key={globalIndex}>
                      {/*
                       * サムネイルボタン
                       * - button 要素にすることでキーボード操作（Enter/Space）と
                       *   スクリーンリーダーの「クリック可能」通知を担保する
                       * - aspect-[4/3]: 同比率でサムネイルを揃える（docs/DESIGN.md 8.5 より）
                       */}
                      <button
                        type="button"
                        aria-label={`${image.alt}（クリックで拡大）`}
                        className="group relative block w-full overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                        onClick={(e) =>
                          openLightbox(
                            globalIndex,
                            e.currentTarget,
                          )
                        }
                      >
                        {/*
                         * aspect-[4/3]: 縦横比 4:3 を固定してガタつきを防ぐ
                         * relative: next/image の fill 配置に必要な親要素の position
                         * group-hover のスケールでホバー時に拡大演出を付ける
                         */}
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/*
       * Lightbox
       * currentIndex が null のときは内部で何もレンダリングしない
       */}
      <Lightbox
        images={ALL_IMAGES}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={goNext}
        onPrev={goPrev}
      />
    </>
  );
}
