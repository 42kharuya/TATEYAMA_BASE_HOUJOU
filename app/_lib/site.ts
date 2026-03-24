export const SITE = {
  name: "TATEYAMA BASE 北条",
  address: "〒294-0045 千葉県館山市北条2278-3",
  /**
   * Google Maps URL。
   * NEXT_PUBLIC_MAP_URL 未設定時は undefined → 地図 CTA が「準備中」になる。
   * 確定値: https://maps.app.goo.gl/n8sJhzN3JK3f2L2QA（.env.local に設定して使用）
   */
  mapUrl: process.env.NEXT_PUBLIC_MAP_URL,
  /**
   * 公式 LINE URL。
   * NEXT_PUBLIC_LINE_URL 未設定時は undefined → LINE CTA が「準備中」になる。
   */
  lineUrl: process.env.NEXT_PUBLIC_LINE_URL,
} as const;
