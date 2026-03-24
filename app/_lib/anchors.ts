export const ANCHOR_IDS = {
  gallery: "gallery",
  pricing: "pricing",
  access: "access",
  booking: "booking",
} as const;

export type AnchorKey = keyof typeof ANCHOR_IDS;

export function anchorHref(key: AnchorKey): `#${string}` {
  return `#${ANCHOR_IDS[key]}`;
}
