/**
 * CTAButton — 行動喚起ボタンコンポーネント
 *
 * 役割（variant）に応じてスタイルを変え、URL 未設定時は「準備中」で無効化する。
 *
 * variant の使い分け（docs/DESIGN.md 8.4 より）:
 *   - "primary"         : 最も押してほしい行動（sky-600 塗り）  例: ご宿泊予約
 *   - "secondary"       : 次点の補助行動（sky-600 枠）          例: LINE で問い合わせ
 *   - "tertiary"        : 補助的なリンク（テキスト下線）         例: Googleマップで開く
 *   - "outlined-white"  : accent 帯（sky 背景）上での白枠ボタン 例: 予約CTA（Issue #25）
 *   - "primary-inverse" : accent 帯（sky 背景）上での白塗りボタン（Issue #27）
 *
 * 無効化（URL 未設定時）:
 *   - ボタン文言を「準備中」に切り替える
 *   - クリック不可（aria-disabled + カーソル禁止）
 *   - description が渡された場合は 1 行の補足説明を直下に表示する
 */

/**
 * outlined-white  : accent 帯（bg-sky-600 / bg-sky-700）上の白枠ボタン（Issue #25）
 * primary-inverse : accent 帯上の白塗り・sky 文字ボタン（Issue #27）
 * → どちらも「sky 背景に対して視認性を確保するための反転系」
 */
type Variant = "primary" | "secondary" | "tertiary" | "outlined-white" | "primary-inverse";

type CTAButtonProps = {
  /** ボタンの重要度（デフォルト: "primary"） */
  variant?: Variant;
  /**
   * ボタンサイズ（デフォルト: "md"）。
   * - "sm": ヘッダーなど高さ制限のある箇所に使用（h-9 px-4）
   * - "md": 通常のCTA（h-11 px-5）
   */
  size?: "sm" | "md";
  /**
   * リンク先 URL。
   * undefined または空文字の場合、ボタンは「準備中」として無効化される。
   */
  href?: string;
  /** 有効時に表示するボタン文言 */
  children: React.ReactNode;
  /**
   * 無効時（準備中）に表示する補足説明文。
   * 例: "予約（STORES）は準備中です。"
   */
  description?: string;
  /** true の場合 target="_blank" + rel="noopener noreferrer" を付与する */
  external?: boolean;
};

// ---- スタイル定義 ----

/** すべての variant に共通するベースクラス */
// shadow-sm: DESIGN.md §8.4 準拠（ボタンに軽い影を付けて立体感を出す）
// transition-colors: opacity だけでなく背景色・枠線色も滑らかに変化させる
const BASE =
  "inline-flex items-center justify-center rounded-lg text-sm font-medium shadow-sm transition-colors";

/** サイズ別のクラス（height / padding） */
const SIZE_CLASSES: Record<"sm" | "md", string> = {
  /** sm: ヘッダーなど縦幅を抑えたい箇所で使用 */
  sm: "h-9 px-4",
  /** md: 標準サイズ（セクション内 CTA 等） */
  md: "h-11 px-5",
};

/** 有効時の variant 別スタイル */
const VARIANT_STYLES: Record<Variant, string> = {
  /*
   * primary: bg-sky-600（海ブルー）= ブランドカラー（DESIGN.md §8.3）
   * ホバーで bg-sky-700 に変化（opacity 変化より「色変化」の方が意図が明確）
   * active: bg-sky-800（押した瞬間さらに濃く）
   * focus-visible: キーボード操作時のフォーカスリング（DESIGN.md §4.2・§8.4 必須要件）
   */
  primary:
    "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
  /*
   * secondary: sky-600 の枠線 + sky-700 テキスト
   * border-2 にして primary との視覚的な重みを揃える
   * hover:bg-sky-50 で「気づきやすい変化」を提供
   */
  secondary:
    "border-2 border-sky-600 text-sky-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
  /*
   * tertiary: テキストリンク風。DESIGN.md §8.3 のリンク色（sky-700）に統一
   * hover:text-sky-800 でやや濃くして変化を伝える
   */
  tertiary:
    "text-sky-700 underline underline-offset-4 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
  /*
   * outlined-white: accent 帯（bg-sky-600 / bg-sky-700）上で使用（Issue #25）
   * 白い枠線 + 白文字で、濃い青背景に対してコントラストを確保する
   * hover:bg-white/20（旧 /15）: ホバー視認性向上（Issue #86）
   *   bg-sky-700 (#0369a1) 上で白 20% オーバーレイ → コントラスト比 ≒ 4.6（WCAG AA 適合）
   */
  "outlined-white":
    "border-2 border-white text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sky-700",
  /*
   * primary-inverse: accent 帯（sky 背景）上での白塗りボタン（Issue #27）
   * 白い背景 + sky-700 テキストで、濃い青帯に対して最大コントラストを確保
   * outlined-white より視覚的重みが大きく「最もクリックしてほしい」場面で使う
   */
  "primary-inverse":
    "bg-white text-sky-700 hover:bg-sky-50 active:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sky-700",
};

/**
 * 無効状態のクラスを生成する。
 * DESIGN.md §8.4「薄くする（opacity）＋カーソル禁止」に準拠。
 * opacity-50 は §8.4 の規定値（旧 opacity-40 より視認しやすく、かつ「押せない」感を伝える）
 */
function disabledClass(variant: Variant): string {
  return `${VARIANT_STYLES[variant]} opacity-50 cursor-not-allowed`;
}

export function CTAButton({
  variant = "primary",
  size = "md",
  href,
  children,
  description,
  external = false,
}: CTAButtonProps) {
  // href が undefined / 空文字の場合は「準備中」として無効化
  const isDisabled = !href;
  // BASE + サイズクラス + variant スタイルを結合
  const className = `${BASE} ${SIZE_CLASSES[size]} ${isDisabled ? disabledClass(variant) : VARIANT_STYLES[variant]}`;

  return (
    <div className="flex flex-col gap-1">
      {isDisabled ? (
        // 無効状態: <span> でレンダリングしてクリックイベントを防ぐ
        // aria-disabled="true" でスクリーンリーダーに無効状態を伝える
        <span
          role="button"
          aria-disabled="true"
          aria-label="準備中"
          title="準備中"
          className={className}
        >
          準備中
        </span>
      ) : (
        // 有効状態: <a> タグでリンクとしてレンダリング
        <a
          href={href}
          className={className}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      )}

      {/* 無効時にのみ description を表示する（1行の補足説明） */}
      {isDisabled && description && (
        <p className="text-xs text-stone-500 dark:text-zinc-400">{description}</p>
      )}
    </div>
  );
}
