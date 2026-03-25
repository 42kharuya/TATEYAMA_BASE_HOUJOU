export const ANCHOR_IDS = {
  summary: "summary",
  pricing: "pricing",
  features: "features",
  facilities: "facilities",
  access: "access",
  booking: "booking",
} as const;

export type AnchorKey = keyof typeof ANCHOR_IDS;

export function anchorHref(key: AnchorKey): `#${string}` {
  return `#${ANCHOR_IDS[key]}`;
}
