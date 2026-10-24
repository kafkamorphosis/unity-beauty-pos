"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shell/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listMyOrders, type MyOrder } from "@/lib/data/seller";
import { formatDateTime } from "@/lib/domain/dates";
import { errorMessage } from "@/lib/domain/errors";
import { formatOrderNo } from "@/lib/domain/order-no";
import { formatOrderTotal } from "@/lib/domain/order-total";
import { formatPhone } from "@/lib/domain/phone";
import type { OrderStatus } from "@/lib/domain/types";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";

const PAGE = 50;
const FILTERS: (OrderStatus | "")[] = ["", "pending", "new", "ready", "picked_up", "cancelled"];
// Sellers have no Realtime access to orders, so the list refreshes on focus and on a timer.
const REFRESH_MS = 30_000;

export function MyOrdersScreen() {
  const [rows, setRows] = useState<MyOrder[] | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [filter, setFilter] = useState<OrderStatus | "">("");

  const load = useCallback(
    () =>
      listMyOrders(supabaseBrowser(), limit, 0)
        .then(setRows)
        .catch((e) => toast.error(errorMessage(e))),
    [limit],
  );

  useEffect(() => {
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), REFRESH_MS);
    const onFocus = () => document.visibilityState === "visible" && load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [load]);

  const shown = rows?.filter((o) => !filter || o.status === filter) ?? [];
  const count = (s: OrderStatus | "") => rows?.filter((o) => !s || o.status === s).length ?? 0;

  return (
    <>
      <PageHeader title={uz.seller.myOrdersTitle} />
      <div className="waybill">
        <div role="radiogroup" aria-label={uz.orders.status} className="flex flex-wrap gap-1.5 border-b border-ink p-2">
          {FILTERS.map((s) => (
            <button
              key={s || "all"}
              type="button"
              role="radio"
              aria-checked={filter === s}
              onClick={() => setFilter(s)}
              className={cn(
                "h-9 rounded-sm border px-3 text-sm font-semibold transition-colors duration-150",
                filter === s ? "border-ink bg-ink text-cell" : "border-rule-soft bg-cell hover:bg-paper",
              )}
            >
              {s ? uz.status[s] : uz.seller.all}
              <span className="num ml-1.5 opacity-70">{count(s)}</span>
            </button>
          ))}
        </div>

        {rows === null ? (
          <div className="grid gap-px">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16 rounded-none" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <p className="px-4 py-12 text-center text-ink-2">{rows.length === 0 ? uz.seller.myOrdersEmpty : uz.seller.noMatch}</p>
        ) : (
          <ul>
            {shown.map((o) => (
              <li key={o.id} className="border-b border-rule-soft last:border-0">
                <Link href={`/buyurtmalarim/${o.id}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-3 py-3 hover:bg-paper active:bg-paper">
                  <span className="monument text-xl">{formatOrderNo(o.order_no)}</span>
                  <span className="min-w-0 text-sm">
                    <span className="block truncate font-semibold">{o.customer?.name || "—"}</span>
                    <span className="num block truncate text-xs text-ink-3">
                      {o.customer ? formatPhone(o.customer.phone) : ""} · {formatDateTime(o.created_at)}
                      {o.destination ? ` · ${uz.destination[o.destination]}` : ""}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className={cn("num font-bold whitespace-nowrap", o.status === "cancelled" && "text-ink-3 line-through")}>
                      {formatOrderTotal(o)}
                    </span>
                    <StatusBadge status={o.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {rows && rows.length >= limit && (
          <div className="flex justify-center border-t border-ink p-2">
            <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + PAGE)}>
              {uz.seller.loadMore}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
