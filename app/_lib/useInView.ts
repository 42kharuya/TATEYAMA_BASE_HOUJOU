/**
 * useInView — スクロール連動「表示域に入ったか」判定フック（Issue #76）
 *
 * 役割:
 *   Intersection Observer API を使って、要素が表示域（viewport）に
 *   入ったタイミングを検知し、boolean フラグ `isInView` を返す。
 *
 * Intersection Observer とは？
 *   「ある要素がどのくらい画面に見えているか」をブラウザが非同期に通知する API。
 *   scroll イベントと異なり、毎フレーム座標計算をしないため CPU 負荷が低い。
 *
 * 使い方:
 *   const { ref, isInView } = useInView();
 *   <div ref={ref} className={isInView ? "visible" : "hidden"} />
 *
 * オプション:
 *   threshold — 要素の何割が見えたら「表示済み」とするか（0.0〜1.0）
 *               デフォルト 0.12 = 12% 見えたら発火
 *   rootMargin — viewport の拡縮マージン（例: "-50px" で少し手前で発火）
 *
 * 一度表示されたら Observer を切断するため、再スクロールでリセットされない。
 */

"use client";

import { useEffect, useRef, useState } from "react";

export type UseInViewOptions = Pick<
  IntersectionObserverInit,
  "threshold" | "rootMargin"
>;

export function useInView(options?: UseInViewOptions) {
  // ref: 監視対象の DOM 要素を参照する
  const ref = useRef<HTMLDivElement>(null);

  // isInView: 表示域に一度でも入ったら true になる（一方通行）
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // SSR（サーバーサイドレンダリング）時は DOM が存在しないためスキップ
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 表示域に入ったフラグを立てる
          setIsInView(true);
          // 一度表示されたら監視を解除してメモリを解放する
          observer.disconnect();
        }
      },
      {
        // threshold: デフォルト 12% 表示で発火（上下に素早くスクロールしても安定）
        threshold: 0.12,
        ...options,
      }
    );

    observer.observe(el);

    // クリーンアップ: コンポーネントがアンマウントされたら Observer を必ず解除する
    return () => {
      observer.disconnect();
    };
    // options オブジェクトが毎レンダーで再生成されないよう依存配列は空にする
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, isInView };
}
