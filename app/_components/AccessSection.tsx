/**
 * AccessSection — アクセスセクション
 *
 * 役割: 住所・埋め込み地図・交通手段を表示し、初めて訪れるユーザーの不安を取り除く。
 *
 * 構成:
 *   1. 住所（郵便番号+住所）
 *   2. Google Maps 埋め込み iframe（APIキー不要・住所クエリ方式）
 *   3. 地図 CTA（Googleマップで開く … 補助的なリンクボタン）
 *      - NEXT_PUBLIC_MAP_URL 未設定時は「準備中」で無効化
 *   4. 最寄り情報（駅・海）
 *   5. 交通手段
 *
 * データの根拠: docs/FACTS.md（確定情報のみ）
 * 環境変数: NEXT_PUBLIC_MAP_URL（未設定時は地図 CTA が「準備中」）
 * 地図埋め込み: SITE.address を encodeURIComponent でクエリ化 → APIキー不要
 */

import { ANCHOR_IDS } from "../_lib/anchors";
import { SITE } from "../_lib/site";
import { CTAButton } from "./CTAButton";
import { Section } from "./Section";

// ---- 確定情報（docs/FACTS.md より） ----

/** 最寄り情報（数値は一次情報に基づき「約」を付ける） */
const NEARBY = [
  { label: "館山駅", detail: "約650m（徒歩約9分）" },
];

/**
 * 交通手段（docs/FACTS.md 交通手段別ルートより）
 *
 * - detail が null の手段は「要確認」として表示する
 * - detail が string の場合は1行で表示する
 * - detail が string[] の場合は箇条書きで複数路線を表示する（バスなど）
 * - href を指定すると detail の末尾に「公式サイトへ →」リンクを追加する（外部サイト委譲用）
 * - 確定情報のみ detail に記載し、未確定は null を入れる
 * - 根拠: docs/FACTS.md
 */
const TRANSPORT_OPTIONS: {
  label: string;
  detail: string | string[] | null;
  /** 公式サイト等の外部リンク。指定時は detail の後に「公式サイトへ →」を表示する */
  href?: string;
}[] = [
  {
    label: "電車",
    // 根拠: JR内房線で館山駅下車→約650m（徒歩約9分）（docs/FACTS.md 確定情報）
    detail: "JR内房線で館山駅下車、約650m（徒歩約9分）",
  },
  {
    label: "車",
    // 富津館山道路 富浦ICからのルートは未確認のため要確認
    detail: "富津館山道路 富浦ICから約4.7km（車で約10分）",
  },
  {
    label: "バス",
    // 根拠: 日東交通・JRバス関東公式サイト（2026年3月確認）
    detail: [
      "【日東交通】房総なのはな号：東京駅 ↔ 館山・白浜",
      "【日東交通】新宿なのはな号：新宿 ↔ 館山",
      "【日東交通】南総里見号：千葉 ↔ 館山",
      "【日東交通】館山・君津 ↔ 羽田空港・横浜",
      "【JRバス関東】東京・新宿 ↔ 上総湊・館山・安房白浜",
    ],
  },
  {
    label: "高速ジェット",
    // 根拠: 東海汽船が夏季限定で竹芝〜館山・白浜を運航（2026年3月確認）
    // 不定期運航のため詳細は公式サイトに委譲する
    detail: "運航（竹芝 ↔ 館山）は不定期のため、東海汽船公式サイトでご確認下さい。",
    href: "https://www.tokaikisen.co.jp",
  },
  {
    label: "フェリー",
    // 根拠: 東京湾フェリー（久里浜↔金谷）→ JR内房線（2026年3月確認）
    detail: [
      "久里浜港（神奈川県横須賀市）↔ 金谷港（千葉県富津市）",
      "金谷港からJR内房線で約35分 → 館山駅下車",
      "館山駅から徒歩約9分（約650m）",
    ],
  },
];

/**
 * Google Maps 埋め込み用 URL を住所から生成する関数
 *
 * - encodeURIComponent: 日本語・記号をURLで安全に扱える文字列に変換する
 * - output=embed: iframeで地図を表示するための専用パラメータ（APIキー不要）
 * - hl=ja: 地図の表示言語を日本語に固定する
 */
function buildMapEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=ja`;
}

/** iframe 埋め込み URL（SITE.address から自動生成） */
const MAP_EMBED_URL = buildMapEmbedUrl(SITE.address);

export function AccessSection() {
  return (
    // id="access" を設定して、ヘッダーや他セクションの「アクセス」リンクから到達できるようにする
    // variant="tinted": 最後に柔らかくまとめるオフホワイト帯
    <Section
      id={ANCHOR_IDS.access}
      title="アクセス"
      lead="館山駅から徒歩圈内。海まで徒歩約30秒の好立地です。"
      variant="tinted"
    >
      {/* ---- 住所 + 埋め込み地図 + 地図 CTA ---- */}
      <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-100 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        {/* 住所 */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            住所
          </p>
          <p className="mt-1 text-base font-medium text-stone-900 dark:text-zinc-50">
            {SITE.address}
          </p>
        </div>

        {/*
         * Google Maps 埋め込み iframe
         *
         * - aspect-video: 横16:縦9 の比率で自動的に高さを決める（レスポンシブ対応）
         * - w-full: 親要素の横幅に追従させる
         * - loading="lazy": スクロールして表示されるまで読み込みを遅らせる（パフォーマンス最適化）
         * - title: スクリーンリーダーが「何のiframeか」を読み上げるために必要（アクセシビリティ）
         * - referrerPolicy: プライバシー配慮（参照元URLをGoogleに送らない）
         */}
        <div className="overflow-hidden rounded-lg">
          <iframe
            src={MAP_EMBED_URL}
            title="TATEYAMA BASE 北条 の地図"
            className="aspect-video w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        {/*
         * 地図 CTA（補助的なリンクボタン）
         * 埋め込みマップで場所は確認できるが、アプリで開いてナビしたい人向けに残す。
         * CTAButton に SITE.mapUrl を渡す。
         * undefined（NEXT_PUBLIC_MAP_URL 未設定）の場合は CTAButton が自動で「準備中」に切り替える。
         * variant="tertiary": テキストリンク風の控えめなスタイル
         */}
        <CTAButton
          variant="tertiary"
          href={SITE.mapUrl}
          external
          description={!SITE.mapUrl ? "地図リンクは準備中です。" : undefined}
        >
          Googleマップで開く
        </CTAButton>
      </div>

      {/* ---- 最寄り情報 ---- */}
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
          最寄り
        </h3>
        {/* dl（definition list）: 名称と補足をペアで表現するセマンティックな要素 */}
        <dl className="mt-3 space-y-2">
          {NEARBY.map((item) => (
            <div key={item.label} className="flex items-baseline gap-3">
              <dt className="w-28 shrink-0 text-sm font-medium text-stone-900 dark:text-zinc-50">
                {item.label}
              </dt>
              <dd className="text-sm text-stone-600 dark:text-zinc-400">
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---- 交通手段 ---- */}
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
          交通手段
        </h3>
        {/*
         * dl（definition list）: 手段名とルート詳細をペアで表現するセマンティックな要素
         * detail が null の手段はプレースホルダー「要確認」を表示し、
         * 確定次第 FACTS.md を更新してから detail に記載する
         */}
        <dl className="mt-3 space-y-2">
          {TRANSPORT_OPTIONS.map((option) => (
            <div key={option.label} className="flex items-baseline gap-3">
              <dt className="w-28 shrink-0 text-sm font-medium text-stone-900 dark:text-zinc-50">
                {option.label}
              </dt>
              <dd className="text-sm text-stone-600 dark:text-zinc-400">
                {/*
                 * detail が null（未確認）: 「要確認」バッジを表示
                 * detail が string（1路線）: テキストをそのまま表示
                 * detail が string[]（複数路線）: 箇条書きリストで表示（バスなど）
                 * href あり: detail の後に「公式サイトへ →」リンクを表示（外部サイト委譲）
                 * 確定後は FACTS.md に追記し、detail を更新するとUIが自動で切り替わる
                 */}
                {option.detail === null ? (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    要確認
                  </span>
                ) : Array.isArray(option.detail) ? (
                  // 複数路線は ul リストで表示する
                  <ul className="space-y-0.5">
                    {option.detail.map((route) => (
                      <li key={route}>{route}</li>
                    ))}
                  </ul>
                ) : (
                  // 1行テキスト。href がある場合は「公式サイトへ →」リンクを末尾に追加する
                  <span>
                    {option.detail}
                    {option.href && (
                      <a
                        href={option.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center gap-0.5 text-xs text-stone-500 underline underline-offset-2 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        公式サイトへ
                        {/* ↗ アイコン: 外部リンクであることを視覚的に示す */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                          className="h-3 w-3"
                        >
                          <path
                            d="M3.5 3H9m0 0v5.5M9 3 3 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
