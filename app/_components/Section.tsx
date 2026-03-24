type HeadingLevel = 2 | 3;

type Props = {
  id?: string;
  title: string;
  lead?: string;
  headingLevel?: HeadingLevel;
  children?: React.ReactNode;
};

export function Section({
  id,
  title,
  lead,
  headingLevel = 2,
  children,
}: Props) {
  const HeadingTag = headingLevel === 3 ? "h3" : "h2";
  const headingClassName =
    headingLevel === 3
      ? "text-xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50"
      : "text-2xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50";

  return (
    <section id={id} className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <header className="space-y-2">
          {/*
           * border-l-4 border-sky-500: 海ブルーの左ボーダーラインでブランドカラーを導入（Issue #23）
           * pl-3: ボーダーと文字の間にスペースを確保
           */}
          <HeadingTag className={`${headingClassName} border-l-4 border-sky-500 pl-3`}>
            {title}
          </HeadingTag>
          {lead ? (
            <p className="max-w-3xl text-base leading-7 text-stone-600 dark:text-zinc-400">
              {lead}
            </p>
          ) : null}
        </header>
        {children ? <div className="space-y-4">{children}</div> : null}
      </div>
    </section>
  );
}
