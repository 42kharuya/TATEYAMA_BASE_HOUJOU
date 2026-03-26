/**
 * FadeIn — スクロール連動フェードインラッパーコンポーネント（Issue #76）
 *
 * 役割:
 *   子要素を <div> でラップし、表示域に入ったタイミングで
 *   フェードイン＋スライドアップアニメーションを発火させる。
 *
 * 使い方:
 *   <FadeIn>
 *     <SomeSection />
 *   </FadeIn>
 *
 * 注意:
 *   - Hero / SummarySection（ファーストビュー内要素）には **適用しない**
 *     理由: ページ読み込み直後に見える要素がフラッシュすると UX が悪化するため
 *   - "use client" が必要な理由: useInView が useEffect / useRef を使うため
 *
 * アクセシビリティ:
 *   globals.css の @media (prefers-reduced-motion: reduce) で
 *   アニメーションが自動的に無効化されるため、本コンポーネント側での
 *   追加対応は不要。
 */

"use client";

import { useInView, type UseInViewOptions } from "../_lib/useInView";

type Props = {
  children: React.ReactNode;
  /** 追加で当てたい Tailwind クラスなど */
  className?: string;
  /** Intersection Observer のオプション（省略時はデフォルト値を使用） */
  observerOptions?: UseInViewOptions;
};

export function FadeIn({ children, className = "", observerOptions }: Props) {
  // useInView フックから「監視対象の ref」と「表示域に入ったか」を受け取る
  const { ref, isInView } = useInView(observerOptions);

  return (
    <div
      ref={ref}
      className={[
        // 表示状態に応じてクラスを切り替える
        // fade-in-ready  : opacity:0 + translateY(20px)（globals.css で定義）
        // fade-in-visible: fade-in-up アニメーションを実行（globals.css で定義）
        isInView ? "fade-in-visible" : "fade-in-ready",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
