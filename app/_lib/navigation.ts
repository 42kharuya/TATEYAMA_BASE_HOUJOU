import { anchorHref } from "./anchors";

export type NavItem = {
  key: "booking" | "about" | "features" | "gallery" | "facilities" | "pricing" | "access";
  label: string;
  href?: string;
  disabled?: boolean;
};

export function getHeaderNavItems(): NavItem[] {
  return [
    {
      key: "about",
      label: "当別荘について",
      href: anchorHref("about"),
    },
    {
      key: "features",
      label: "魅力",
      href: anchorHref("features"),
    },
    {
      key: "gallery",
      label: "ギャラリー",
      href: anchorHref("gallery"),
    },
    {
      key: "facilities",
      label: "別荘設備",
      href: anchorHref("facilities"),
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
    {
      key: "booking",
      label: "お問い合わせ",
      href: anchorHref("booking"),
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
