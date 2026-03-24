import { anchorHref } from "./anchors";

export type NavItem = {
  key: "booking" | "gallery" | "pricing" | "access";
  label: string;
  href?: string;
  disabled?: boolean;
};

export function getHeaderNavItems(): NavItem[] {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return [
    {
      key: "booking",
      label: "予約",
      href: bookingUrl,
      disabled: !bookingUrl,
    },
    {
      key: "gallery",
      label: "ギャラリー",
      href: anchorHref("gallery"),
    },
    {
      key: "pricing",
      label: "料金",
      href: anchorHref("pricing"),
    },
    {
      key: "access",
      label: "アクセス",
      href: anchorHref("access"),
    },
  ];
}

export function getFooterCtaItems(): NavItem[] {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return [
    {
      key: "booking",
      label: "ご宿泊予約",
      href: bookingUrl,
      disabled: !bookingUrl,
    },
  ];
}
