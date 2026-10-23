import { Bell, Boxes, ChartColumn, Contact, ReceiptText, ScanBarcode, Settings, Truck, Users, type LucideIcon } from "lucide-react";
import { uz } from "@/lib/i18n/uz";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shows the live low-stock count. */
  badge?: "lowStock";
  /** On phones this item lives in the "Boshqa" sheet instead of the bottom bar. */
  more?: boolean;
};

// Server layouts pick a menu by name; icons are components and can't cross to the client as props.
export type NavKey = "pos" | "admin";

export const NAV: Record<NavKey, NavItem[]> = {
  pos: [
    { href: "/", label: uz.nav.checkout, icon: ScanBarcode },
    { href: "/ombor", label: uz.nav.inventory, icon: Boxes },
    { href: "/buyurtmalar", label: uz.nav.orders, icon: ReceiptText },
    { href: "/tekpe", label: uz.nav.tekpe, icon: Truck },
    { href: "/mijozlar", label: uz.nav.customers, icon: Contact, more: true },
    { href: "/statistika", label: uz.nav.analytics, icon: ChartColumn, more: true },
    { href: "/bildirishnomalar", label: uz.nav.notifications, icon: Bell, badge: "lowStock", more: true },
  ],
  admin: [
    { href: "/admin", label: uz.nav.admin, icon: Users },
    { href: "/admin/sozlamalar", label: uz.nav.settings, icon: Settings },
  ],
};

export function isActive(pathname: string, href: string): boolean {
  if (href === "/" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}
