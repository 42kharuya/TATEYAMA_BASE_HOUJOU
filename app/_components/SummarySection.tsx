/**
 * SummarySection — 要点サマリーセクション（Hero 直下）
 *
 * 目的: スクロールせずに「泊まれるか判断できる最小情報」をひと目で伝え、
 *       予約決断を最短化する。
 *
 * 表示する情報（docs/FACTS.md の確定値）:
 *   - 宿泊可能人数: 4〜8名
 *   - 海まで: 徒歩約2分
 *   - 館山駅から: 徒歩約9分
 *
 * ※住所は AccessSection に掲載（Issue #77 / docs/DECISIONS.md 参照）
 *
 * デザイン準拠: docs/DESIGN.md（余白・フォント・カラールール）
 * セマンティック: <section> + <h2> + <ul> で見出し階層を維持
 */

// ────────────────────────────────────────────────────────
// アイコン（インライン SVG）
// aria-hidden="true" + title なしで、装飾用として扱う
// ────────────────────────────────────────────────────────

/** 人のシルエット（宿泊人数） */
function UsersIcon() {
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
      {/* メインの人物 */}
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      {/* サブの人物 */}
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
  );
}

/** 波形（海まで） */
function WavesIcon() {
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
      {/* 波の曲線 2 本 */}
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  );
}

/** 歩行者（徒歩時間）— 道路標識風の歩行者シルエット */
function WalkIcon() {
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
      {/* 頭 */}
      <circle cx="12" cy="4" r="1.75" />
      {/* 胴体（肩〜腰） */}
      <path d="M12 7v5" />
      {/* 腕（左右に広がる） */}
      <path d="M9 9l3 2 3-2" />
      {/* 脚（左脚・右脚） */}
      <path d="M12 12l-2 6" />
      <path d="M12 12l2.5 6" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────
// サマリーアイテムの型定義
// ────────────────────────────────────────────────────────

type SummaryItem = {
  /** スクリーンリーダー向けのラベル（例: "宿泊可能人数"） */
  label: string;
  /** 表示値（例: "4〜8名"） */
  value: string;
  /** アイコンコンポーネント */
  icon: React.ReactNode;
};

// ────────────────────────────────────────────────────────
// サマリーデータ（docs/FACTS.md の確定値を使用）
// 距離・時間の数値は「約」付き（docs/DECISIONS.md 準拠）
// ────────────────────────────────────────────────────────

// 住所は AccessSection に掲載するため、ここでは3項目のみ表示する（Issue #77）
const SUMMARY_ITEMS: SummaryItem[] = [
  {
    label: "宿泊人数",
    // 「4〜8名」をそのままメイン値として大きく出す
    value: "4〜8名",
    icon: <UsersIcon />,
  },
  {
    // ラベルに「海まで徒歩」、数値（秒）だけを大きく打ち出す
    label: "海まで徒歩",
    value: "約2分",
    icon: <WavesIcon />,
  },
  {
    // ラベルに「館山駅から徒歩」、数値（分）だけを大きく打ち出す
    label: "館山駅から徒歩",
    value: "約9分",
    icon: <WalkIcon />,
  },
];

// ────────────────────────────────────────────────────────
// SummarySection コンポーネント
// ────────────────────────────────────────────────────────

export function SummarySection() {
  return (
    /*
     * <section>: ARIA + セマンティック HTML
     * id="summary": ページ内アンカー用（将来のヘッダーリンク等に対応）
     * aria-labelledby: h2 と紐付けてセクションの意味をスクリーンリーダーに伝える
     */
    <section
      id="summary"
      aria-labelledby="summary-heading"
      /**
       * bg-sky-600: Hero 直後に海ブルーの accent 帯を置き、施設スペックを目立たせる（Issue #25）
       * relative overflow-hidden: 下端の波形SVGを絶対配置するためのコンテナ（Issue #78）
       * pt-10 pb-20 sm:pt-14 sm:pb-24: 下端に波形（高さ ~64px）のぶんだけ余分な padding を確保する
       */
      className="relative overflow-hidden bg-sky-600 pt-10 pb-20 sm:pt-14 sm:pb-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/*
         * h2: 見出し階層を守るために必須（h1=Hero, h2=各セクション）
         * text-xl に押えてコンパクトさを維持する
         * text-white: accent帯では白文字に反転（Issue #25）
         */}
        <h2
          id="summary-heading"
          className="mb-6 text-xl font-semibold tracking-tight text-white"
        >
          基本情報
        </h2>

        {/*
         * <ul role="list">: 箇条書きリストとして意味を持たせる
         * grid: モバイル 2列 → sm 以上で 3列（人数・海まで・駅まで）
         * 住所は AccessSection に委ねて統一感を保つ（Issue #77）
         */}
        <ul
          role="list"
          className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3"
        >
          {SUMMARY_ITEMS.map((item) => (
            <li key={item.label} className="flex flex-col gap-2">
              {/*
               * アイコン: accent帯では text-sky-200 で少し抑えた白（眩しくしない）（Issue #25）
               * サイズは 24×24 px（タッチ対象ではないため小さくてよい）
               */}
              <span className="text-sky-200" aria-hidden="true">
                {item.icon}
              </span>

              {/*
               * ラベル: accent帯では text-sky-100 でサポートテキストを柔らかく表示（Issue #25）
               * <dt> ではなく <span> にして視覚的なシンプルさを保つ
               */}
              <span className="text-sm leading-tight text-sky-100">
                {item.label}
              </span>

              {/*
               * 値（メインの数値・キーワード）: Issue #26 タイポグラフィ強弱
               * 3項目すべて数値・人数なので text-3xl font-bold tabular-nums で統一する
               * tabular-nums: 数字幅を均等にそろえ、数値の視認性を高める
               */}
              <span className="text-3xl font-bold tabular-nums text-white">
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/*
       * ── 波形ディバイダー（Issue #78） ──────────────────────────
       * 役割: sky-600 → 白背景（FeaturesSection）への視覚的遷移を滑らかにする
       * 実装: SVG の絶対配置。viewBox の高さ 64px に合わせた波形パスを使用
       *   - `preserveAspectRatio="none"`: 横幅にストレッチして隙間ゼロで敷き詰める
       *   - `fill="white"`: FeaturesSection の背景色（white）に合わせる
       *   - `aria-hidden="true"`: 装飾用なのでスクリーンリーダーからは隠す
       * 波形パス: 2周期のサイン波（なだらかで海岸らしいカーブ）
       *   M0,32 → 左端を中間高さからスタート
       *   C ... → ベジェ曲線で山・谷を2回くりかえす
       *   L1440,64 L0,64 Z → 下辺を閉じて塗りつぶし領域を作る
       */}
      <svg
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,32 C240,0 480,64 720,32 C960,0 1200,64 1440,32 L1440,64 L0,64 Z"
          fill="white"
        />
      </svg>
    </section>
  );
}
