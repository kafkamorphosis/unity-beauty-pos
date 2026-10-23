import { Boxes, ReceiptText, ScanBarcode, Truck, type LucideIcon } from "lucide-react";
import { uz } from "@/lib/i18n/uz";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const POS_NAV: NavItem[] = [
  { href: "/", label: uz.nav.checkout, icon: ScanBarcode },
  { href: "/ombor", label: uz.nav.inventory, icon: Boxes },
  { href: "/buyurtmalar", label: uz.nav.orders, icon: ReceiptText },
  { href: "/tekpe", label: uz.nav.tekpe, icon: Truck },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}
