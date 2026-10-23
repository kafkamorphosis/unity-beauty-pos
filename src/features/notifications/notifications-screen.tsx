"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { ProductThumb } from "@/components/product-thumb";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RestockPanel } from "@/features/inventory/restock-panel";
import { StockBar } from "@/features/inventory/stock-stepper";
import type { Product } from "@/lib/database.types";
import { listLowStock } from "@/lib/data/notifications";
import { errorMessage } from "@/lib/domain/errors";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";

export function NotificationsScreen() {
  const [rows, setRows] = useState<Product[] | null>(null);
  const [restocking, setRestocking] = useState<Product | null>(null);

  const refresh = useCallback(() => {
    listLowStock(supabaseBrowser())
      .then(setRows)
      .catch((e) => toast.error(errorMessage(e)));
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const channel = supabaseBrowser()
      .channel("low-stock-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        clearTimeout(timer);
        timer = setTimeout(refresh, 300);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") refresh();
      });
    return () => {
      clearTimeout(timer);
      supabaseBrowser().removeChannel(channel);
    };
  }, [refresh]);

  return (
    <>
      <PageHeader title={uz.notifications.title} />
      <section className="waybill">
        <h2 className="border-b border-ink px-3 py-2 text-base font-bold">{uz.notifications.lowTitle}</h2>
        {rows === null ? (
          <div className="grid gap-px">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-16 rounded-none" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-ink-2">
            <CircleCheck className="size-10 text-ok" strokeWidth={1.5} aria-hidden />
            <p>{uz.notifications.empty}</p>
          </div>
        ) : (
          <ul>
            {rows.map((p) => {
              const out = p.stock <= 0;
              return (
                <li key={p.id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule-soft px-3 py-3 last:border-0", out && "bg-danger-soft/50")}>
                  <ProductThumb path={p.photo_path} size={44} />
                  <div className="min-w-40 flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="num text-xs tracking-wider text-ink-3">{p.barcode}</p>
                  </div>
                  <div className="w-44">
                    <p className={cn("num text-sm font-bold", out ? "text-danger" : "text-warn")}>
                      {uz.notifications.stock(p.stock)} <span className="font-normal text-ink-3">· {uz.notifications.threshold(p.low_stock_threshold)}</span>
                    </p>
                    <div className="mt-1.5">
                      <StockBar stock={p.stock} threshold={p.low_stock_threshold} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setRestocking(p)}>
                    <Plus aria-hidden />
                    {uz.notifications.restock}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={restocking !== null} onOpenChange={(o) => !o && setRestocking(null)}>
        <DialogContent className="gap-0 overflow-hidden border border-ink p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-ink px-4 py-3">
            <DialogTitle className="text-lg">{uz.inventory.restockTitle}</DialogTitle>
          </DialogHeader>
          {restocking && (
            <RestockPanel
              product={restocking}
              onDone={() => {
                setRestocking(null);
                refresh();
              }}
              onCancel={() => setRestocking(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
