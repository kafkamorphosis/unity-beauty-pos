"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/buyurtmalar", label: uz.orders.allOrders },
  { href: "/buyurtmalar/nasiya", label: uz.nasiya.title },
];

// Buyurtmalar submenu: every order, or Nasiya debts.
export function OrdersSubnav() {
  const pathname = usePathname();
  return (
    <nav aria-label={uz.orders.title} className="mb-3 flex gap-1.5">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center rounded-sm border px-4 text-sm font-semibold transition-colors duration-150",
              active ? "border-ink bg-ink text-cell" : "border-rule-soft bg-cell hover:bg-paper",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
