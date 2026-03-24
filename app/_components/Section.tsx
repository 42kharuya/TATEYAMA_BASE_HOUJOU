type HeadingLevel = 2 | 3;

/**
 * variant の種類（Issue #25 視覚リズム改善）:
 *   - "default"      : 白背景（デフォルト）
 *   - "tinted"       : bg-stone-50（柔らかいオフホワイト帯）
 *   - "accent"       : bg-sky-600 テキスト白（目立たせたい重要セクション用）
 *   - "accent-dark"  : bg-sky-700 テキスト白（予約CTAなど最下部の特別帯用）
 */
type Variant = "default" | "tinted" | "accent" | "accent-dark";

type Props = {
  id?: string;
  title: string;
  lead?: string;
  headingLevel?: HeadingLevel;
  /** セクション背景の種類。未指定時は "default"（白背景）を維持する。後方互換あり。 */
  variant?: Variant;
  children?: React.ReactNode;
};

// ---- variant 別スタイル定義 ----

/** セクション全体の背景クラス */
const SECTION_BG: Record<Variant, string> = {
  default: "bg-white",
  tinted: "bg-stone-50",
  // accent: 海ブルー帯。予約CTAや施設スペックを際立たせる
  accent: "bg-sky-600",  // accent-dark: 浓いブルー帯。ページ最下部の予約CTAで隣の accent 帯と差別化
  "accent-dark": "bg-sky-700",};

/** 見出し（h2/h3）のテキスト色クラス */
const HEADING_COLOR: Record<Variant, string> = {
  default: "text-stone-900 dark:text-zinc-50",
  tinted: "text-stone-900 dark:text-zinc-50",
  // accent帯は白文字に反転
  accent: "text-white",
  "accent-dark": "text-white",
};

/** 左ボーダーアクセントラインの色クラス（Issue #23 ブランドカラー準拠） */
const BORDER_COLOR: Record<Variant, string> = {
  default: "border-sky-500",
  tinted: "border-sky-500",
  // accent帯では白いボーダーで視認性を確保
  accent: "border-white/60",
  "accent-dark": "border-white/60",
};

/** リード文のテキスト色クラス */
const LEAD_COLOR: Record<Variant, string> = {
  default: "text-stone-600 dark:text-zinc-400",
  tinted: "text-stone-600 dark:text-zinc-400",
  // accent帯では sky-100 で少し抑えた白（眩しくしない）
  accent: "text-sky-100",  "accent-dark": "text-sky-100",};

export function Section({
  id,
  title,
  lead,
  headingLevel = 2,
  variant = "default",
  children,
}: Props) {
  const HeadingTag = headingLevel === 3 ? "h3" : "h2";
  // headingLevel と variant を組み合わせて見出しのクラスを組み立てる
  const headingClassName =
    headingLevel === 3
      ? `text-xl font-semibold tracking-tight ${HEADING_COLOR[variant]}`
      : `text-2xl font-semibold tracking-tight ${HEADING_COLOR[variant]}`;

  return (
    // variant に応じた背景色を適用。py は全 variant 共通
    <section id={id} className={`${SECTION_BG[variant]} py-12 sm:py-16`}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <header className="space-y-2">
          {/*
           * border-l-4: 見出し左のアクセントライン（Issue #23 ブランドカラー）
           * variant="accent" 時は border-white/60 に切り替えて帯との調和を保つ
           * pl-3: ボーダーと文字の間にスペースを確保
           */}
          <HeadingTag
            className={`${headingClassName} border-l-4 ${BORDER_COLOR[variant]} pl-3`}
          >
            {title}
          </HeadingTag>
          {lead ? (
            <p className={`max-w-3xl text-base leading-7 ${LEAD_COLOR[variant]}`}>
              {lead}
            </p>
          ) : null}
        </header>
        {children ? <div className="space-y-4">{children}</div> : null}
      </div>
    </section>
  );
}
