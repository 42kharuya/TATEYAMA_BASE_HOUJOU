/**
 * CTAButton — 行動喚起ボタンコンポーネント
 *
 * 役割（variant）に応じてスタイルを変え、URL 未設定時は「準備中」で無効化する。
 *
 * variant の使い分け（docs/DESIGN.md 8.4 より）:
 *   - "primary"   : 最も押してほしい行動（塗り）   例: ご宿泊予約
 *   - "secondary" : 次点の補助行動（枠）           例: LINE で問い合わせ
 *   - "tertiary"  : 補助的なリンク（テキスト下線） 例: Googleマップで開く
 *
 * 無効化（URL 未設定時）:
 *   - ボタン文言を「準備中」に切り替える
 *   - クリック不可（aria-disabled + カーソル禁止）
 *   - description が渡された場合は 1 行の補足説明を直下に表示する
 */

type Variant = "primary" | "secondary" | "tertiary";

type CTAButtonProps = {
  /** ボタンの重要度（デフォルト: "primary"） */
  variant?: Variant;
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
const BASE =
  "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium transition-opacity";

/** 有効時の variant 別スタイル */
const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-950",
  secondary:
    "border border-zinc-900 text-zinc-900 hover:opacity-80 dark:border-zinc-50 dark:text-zinc-50",
  tertiary:
    "text-zinc-900 underline underline-offset-4 hover:opacity-70 dark:text-zinc-50",
};

/**
 * 無効状態のクラスを生成する。
 * DESIGN.md の「薄くする（opacity）＋カーソル禁止」に準拠し、
 * variant の色はそのままに opacity-40 + cursor-not-allowed を重ねる。
 */
function disabledClass(variant: Variant): string {
  return `${VARIANT_STYLES[variant]} opacity-40 cursor-not-allowed`;
}

export function CTAButton({
  variant = "primary",
  href,
  children,
  description,
  external = false,
}: CTAButtonProps) {
  // href が undefined / 空文字の場合は「準備中」として無効化
  const isDisabled = !href;
  const className = `${BASE} ${isDisabled ? disabledClass(variant) : VARIANT_STYLES[variant]}`;

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
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
    </div>
  );
}
