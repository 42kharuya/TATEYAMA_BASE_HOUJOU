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

// useState: コンポーネント内に「状態（State）」を持たせる機能。
// useRef: DOM要素への参照を保持するフック（dialog.showModal() の呼び出しに使用）。
// useEffect: マウント/アンマウントなど副作用を実行するフック（dialogのopen/closeイベント管理に使用）。
// useCallback: 関数をメモ化して不要な再生成を防ぐフック（onCloseの安定化に使用）。
import { useState, useRef, useEffect, useCallback } from "react";
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
import livingImg from "../../imgs/first-floor-living.jpg";
import bedImg from "../../imgs/bed.jpg";
import bathRoomImg from "../../imgs/first-floor-bath-room.jpg";
import firstFloorToiletImg from "../../imgs/first-floor-toilet.jpg";
// 2階
import secondFloorImg from "../../imgs/second-floor.jpg";
import tableTennisImg from "../../imgs/facility-table-tennis.jpg";
import mahJonggImg from "../../imgs/facility-mah-jongg.jpg";
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
// Lightbox コンポーネント（HTML <dialog> ネイティブAPI使用）
// ────────────────────────────────────────────────────────

/** ライトボックスの Props */
type LightboxProps = {
  /** 表示する写真一覧（現在フロアの全写真） */
  photos: FloorPhoto[];
  /** 最初に表示する写真インデックス */
  initialIndex: number;
  /** モーダルを閉じるときに呼ぶコールバック（親 State をリセット） */
  onClose: () => void;
};

/**
 * Lightbox
 * 写真を全画面モーダルで拡大表示する。
 *
 * 実装方針:
 *   - HTML <dialog> の showModal() でブラウザネイティブのフォーカストラップを利用
 *   - Escape キーはブラウザが自動処理（dialog の "close" イベントをリッスン）
 *   - 背景（dialog 要素自体）クリックで閉じる
 *   - ← / → キーで前後の写真に移動する
 *
 * アクセシビリティ:
 *   - role="dialog" + aria-modal="true" でスクリーンリーダーに「モーダル」と伝える
 *   - aria-label で現在の写真番号と説明を通知する
 */
function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  // 現在表示している写真インデックスを管理する State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // <dialog> 要素への参照（showModal / close を直接呼ぶために必要）
  const dialogRef = useRef<HTMLDialogElement>(null);

  // onClose を ref に持ち、useEffect の依存配列を安定させる
  // これにより、親コンポーネントの再レンダリングでも useEffect が再実行されない
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // マウント時に showModal() でモーダルを開く
  // アンマウント時は React が DOM を削除するため、明示的な close() は不要
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // showModal(): フォーカストラップ + ::backdrop 付きでモーダルを開く
    if (!dialog.open) dialog.showModal();

    // Escape キーや dialog 自身が close したときに onClose を呼ぶ
    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ← → キーで写真を切り替える（キーボードナビゲーション）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        // 先頭写真の「前」は末尾写真に循環する
        setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
      } else if (e.key === "ArrowRight") {
        // 末尾写真の「次」は先頭写真に循環する
        setCurrentIndex((i) => (i + 1) % photos.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photos.length]);

  // 背景（dialog 要素自体）をクリックしたとき閉じる
  // e.target が dialog 要素本体（コンテンツより外側）のとき = 背景クリック
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    // dialog: ブラウザネイティブのモーダル要素
    // - role="dialog" + aria-modal="true": スクリーンリーダーに「モーダルダイアログ」と伝える
    // - aria-label: 現在の写真番号と内容を AT（支援技術）に通知する
    // - backdrop:bg-black/70: Tailwind の ::backdrop スタイリング
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`写真の拡大表示 ${currentIndex + 1}/${photos.length}: ${currentPhoto.alt}`}
      onClick={handleDialogClick}
      className="m-0 h-screen max-h-screen w-screen max-w-none border-0 bg-black/90 p-0 backdrop:bg-black/70"
    >
      {/*
       * コンテンツラッパー
       * onClick での stopPropagation は使わず、dialog 側で e.target 判定する方式のため不要。
       * ただし背景クリック検出が dialog 要素レベルで完結しているため、
       * 内部要素のクリックは自然にバブリングしても問題ない（e.target が変わるため閉じない）。
       */}
      <div className="relative flex h-full w-full flex-col items-center justify-center">

        {/* 閉じるボタン（×） */}
        <button
          onClick={() => dialogRef.current?.close()}
          aria-label="閉じる"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
        >
          {/* aria-hidden: 「×」記号はボタンの aria-label で読み上げ済みのため除外 */}
          <span aria-hidden="true" className="text-xl leading-none">✕</span>
        </button>

        {/* 写真カウンター（複数枚のときのみ表示） */}
        {photos.length > 1 && (
          <p
            aria-live="polite"
            className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/70 tabular-nums"
          >
            {currentIndex + 1} / {photos.length}
          </p>
        )}

        {/* メイン画像（最大80vh × 全幅。object-contain で縦横比を維持） */}
        <div className="relative h-[80vh] w-full max-w-5xl px-14">
          <Image
            src={currentPhoto.src}
            alt={currentPhoto.alt}
            fill
            className="object-contain"
            sizes="(min-width: 1280px) 1024px, 100vw"
          />
        </div>

        {/* キャプション（写真の alt テキストを再利用） */}
        <p className="absolute bottom-6 left-0 right-0 px-4 text-center text-sm text-white/60">
          {currentPhoto.alt}
        </p>

        {/* 前の写真ボタン（写真が2枚以上のときのみ表示） */}
        {photos.length > 1 && (
          <button
            onClick={() =>
              setCurrentIndex((i) => (i - 1 + photos.length) % photos.length)
            }
            aria-label="前の写真"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span aria-hidden="true">‹</span>
          </button>
        )}

        {/* 次の写真ボタン（写真が2枚以上のときのみ表示） */}
        {photos.length > 1 && (
          <button
            onClick={() => setCurrentIndex((i) => (i + 1) % photos.length)}
            aria-label="次の写真"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span aria-hidden="true">›</span>
          </button>
        )}

      </div>
    </dialog>
  );
}

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

  // ライトボックスの開閉状態を管理する State
  // null = 閉じている / number = その添字の写真を拡大表示中
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 現在アクティブなフロアのデータを配列から検索する
  const activeFacility = FLOOR_FACILITIES.find((f) => f.id === activeId)!;

  // タブを切り替えるときに写真インデックスも 0 にリセットし、ライトボックスも閉じる
  const handleTabChange = (id: string) => {
    setActiveId(id);
    setActivePhotoIndex(0);
    setLightboxIndex(null);
  };

  // onClose を useCallback でメモ化（Lightbox 内 useEffect の安定化）
  const handleLightboxClose = useCallback(() => setLightboxIndex(null), []);

  // ────────────────────────────────────────────────────────
  // タブスクロールヒント（Issue #80）
  // スマホでタブが横スクロールできることをフェードで視覚的に伝える
  // ────────────────────────────────────────────────────────

  // タブリスト要素への参照（scrollLeft / clientWidth / scrollWidth を読み取る）
  const tablistRef = useRef<HTMLDivElement>(null);

  // タブが末端までスクロールされたか。true のときフェードオーバーレイを非表示にする。
  const [isTabEnd, setIsTabEnd] = useState<boolean>(false);

  // スクロール位置を確認してフェードの表示状態を更新するコールバック
  // scrollLeft + clientWidth が scrollWidth に限りなく近い = 末端到達とみなす（余白 4px）
  const updateTabFade = useCallback(() => {
    const el = tablistRef.current;
    if (!el) return;
    setIsTabEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  // マウント直後に初期状態を確認し、scroll イベントを登録する
  // passive: true でスクロール処理を妨げずパフォーマンスを維持
  useEffect(() => {
    const el = tablistRef.current;
    if (!el) return;
    updateTabFade(); // 初期チェック（PCなどタブが全て収まる場合は最初からフェード不要）
    el.addEventListener("scroll", updateTabFade, { passive: true });
    return () => el.removeEventListener("scroll", updateTabFade);
  }, [updateTabFade]);

  // 現在表示中の写真（メイン表示用）
  const activePhoto = activeFacility.photos[activePhotoIndex];

  return (
    <Section
      id={ANCHOR_IDS.facilities}
      title="施設・設備"
      lead={"1棟まるごとお使いいただける全フロアの設備をご確認ください。\n※アメニティ（シャンプー等）は準備中です。"}
    >
      {/*
       * ────────────────────────────────────────────────
       * タブバー
       * overflow-x-auto: スマホで横スクロールを有効化
       * role="tablist": スクリーンリーダーに「タブの集まり」と伝える ARIA ロール
       * ────────────────────────────────────────────────
       */}
      {/* スクロールヒント用のラッパー（relative で内部の absolute フェードを保持） */}
      <div className="relative">
        <div
          ref={tablistRef}
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
         * スクロールヒントフェード（右端グラデーション）
         * - pointer-events-none: 下のタブボタンのクリックを妨げない
         * - md:hidden: PC ではタブが全て表示されるため不要（スマホ専用）
         * - isTabEnd が true（末端到達）になると opacity-0 で透明化
         * - 常時 DOM に存在させ opacity トグルで滑らかにフェードアウト
         */}
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 dark:from-zinc-900 md:hidden",
            isTabEnd ? "opacity-0" : "opacity-100",
          ].join(" ")}
        />
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
             * メイン写真（クリックでライトボックスを開く）
             * button 要素にすることでキーボードフォーカスと Enter/Space での起動に対応
             * cursor-zoom-in: 「拡大できる」とユーザーに視覚的に伝える
             * aspect-[4/3]: 幅:高さ = 4:3 の比率（16:9 より縦に余裕があり設備リストと並べやすい）
             */}
            <button
              type="button"
              onClick={() => setLightboxIndex(activePhotoIndex)}
              aria-label={`写真を拡大表示: ${activePhoto.alt}`}
              className="relative aspect-[4/3] w-full overflow-hidden cursor-zoom-in focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-0"
            >
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
            </button>

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
       * ライトボックスモーダル
       * lightboxIndex が null のとき非表示（コンポーネント自体をアンマウント）
       * key を使わず initialIndex を渡す方式のため、同フロア内での切り替えはコンポーネント内 State で管理
       */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={activeFacility.photos}
          initialIndex={lightboxIndex}
          onClose={handleLightboxClose}
        />
      )}

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
