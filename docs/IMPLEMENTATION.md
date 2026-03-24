# IMPLEMENTATION：実装方針（MVP）

目的：公式サイトMVPを「迷わず・最短」で実装できるように、技術選定・構成・データ参照元・環境変数を固定する。

参照（ソースオブトゥルース）
- 要件：docs/REQUIREMENTS.md
- 情報設計：docs/IA.md
- デザイン：docs/DESIGN.md
- 事実データ：docs/FACTS.md（確定情報のみ）
- 掲載文章：docs/CONTENT.md（内部管理用に（確定/要確認）ラベルが付く）
- 意思決定：docs/DECISIONS.md

## 1. 技術スタック（推奨）

- Next.js（React）
- Tailwind CSS

理由：
- 1ページLPの実装が速い
- 画像最適化・SEOメタの実装がやりやすい
- docs/DESIGN.md のトークン前提（Tailwind）と整合

> メモ：現時点のリポジトリにはWeb実装コードが未作成。
> 実装開始時に、このリポジトリにNext.jsを作成して進める。

## 2. ルーティング（MVP）

- `/` のみ（1ページLP）

将来：
- 料金が長くなったら `/pricing`
- アクセスを厚くしたら `/access`

（将来移行のルールは docs/IA.md に従う）

## 3. セクション構成（MVP / 1ページLP）

セクションID（アンカー）は固定：
- `#pricing`
- `#access`
- `#booking`

セクション順（推奨）：docs/IA.md に従う。

## 4. コンポーネント方針（最小）

- `Header`：常設リンク（予約/料金/アクセス）
- `Hero`：外観画像 + キャッチ + 主要CTA
- `Section`：見出し（h2/h3）と本文の共通枠
- `CTAButton`：Primary/Secondary/Tertiary + 無効（準備中）
- `Gallery`：カテゴリ別サムネ
- `Lightbox`：ギャラリー拡大（MVP要件あり）
- `Footer`：施設名・住所・地図・CTA再掲

スタイルは docs/DESIGN.md「8. 実装サマリー（コンポーネント規約）」を最優先。

## 5. データ参照元（どの情報をどこから出すか）

- 料金表 / キャンセル / レンタル：docs/FACTS.md と一致
- 住所 / 地図URL：docs/REQUIREMENTS.md / docs/FACTS.md
- キャッチコピー / CTA文言：docs/COPY.md / docs/DECISIONS.md
- 設備一覧：docs/FACTS.md

重要：
- docs/CONTENT.md の（確定/要確認）ラベルは「内部管理用」。サイト上にそのまま出さない。
- 未確定項目（アメニティ、チェックイン/アウト時刻、予約URL、LINE URL）は、断定掲載しない／未設定は「準備中」で無効化。

## 6. 環境変数（公開前に設定）

- `NEXT_PUBLIC_BOOKING_URL`
  - 未設定：予約CTAは「準備中」＋クリック不可＋説明1行
- `NEXT_PUBLIC_MAP_URL`
  - 未設定：地図CTAは「準備中」＋クリック不可
- `NEXT_PUBLIC_LINE_URL`
  - 未設定：問い合わせCTAは「準備中」＋クリック不可
- `NEXT_PUBLIC_SITE_URL`
  - OGPのURL生成に使う（未設定なら相対URLで暫定運用）

キーは `.env.example` に定義する（値はコミットしない）。

## 7. 画像方針（パフォーマンス）

- 素材：`imgs/` の手元写真のみ（docs/ASSETS.md）
- Hero：`imgs/hero-exterior.jpg`
- 画像は極端に重くしない（必要ならリサイズ）

## 8. SEO（最低限）

MVPで必須：
- `title` / `description`
- OGP：`og:title` / `og:description` / `og:image`
- `noindex` になっていない

OGP画像：
- まずは `imgs/hero-exterior.jpg` を候補（実装時に扱いやすいサイズへ調整）

## 9. アクセシビリティ（最低限）

- 見出し階層：h1は1つ、以降h2/h3を飛ばさない
- キーボード：主要導線（予約/料金/アクセス/地図/LINE）にTabで到達できる
- Focus Visible：常に見える
- コントラスト：本文 4.5:1、見出し 3:1

### 9.1 ライトボックス（MVP要件）

docs/DESIGN.md の要件を実装で満たす。
- ×で閉じる（`aria-label="閉じる"`）
- `Esc` で閉じる
- 背景クリックで閉じる
- フォーカストラップ
- フォーカス復帰（開いた元サムネイル）
- 背景スクロール停止
- 次へ/前へ（ボタン + `ArrowLeft`/`ArrowRight`）

## 10. 公開前の最終ゲート（抜粋）

- 料金/キャンセル/レンタルが docs/FACTS.md と一致
- 予約/地図/LINE URL が未設定でも「準備中」で無効化できている
- 徒歩表記が「約」付き
- 画像が手元写真のみ
