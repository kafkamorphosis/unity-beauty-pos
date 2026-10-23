import { Boxes, ChartColumn, ReceiptText, ScanBarcode, Settings, Truck, Users, type LucideIcon } from "lucide-react";
import { uz } from "@/lib/i18n/uz";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Server layouts pick a menu by name; icons are components and can't cross to the client as props.
export type NavKey = "pos" | "admin";

export const NAV: Record<NavKey, NavItem[]> = {
  pos: [
    { href: "/", label: uz.nav.checkout, icon: ScanBarcode },
    { href: "/ombor", label: uz.nav.inventory, icon: Boxes },
    { href: "/buyurtmalar", label: uz.nav.orders, icon: ReceiptText },
    { href: "/statistika", label: uz.nav.analytics, icon: ChartColumn },
    { href: "/tekpe", label: uz.nav.tekpe, icon: Truck },
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
