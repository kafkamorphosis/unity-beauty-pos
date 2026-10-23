"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeastSold, getReport, type LeastSoldRow, type Report } from "@/lib/data/analytics";
import { listSellers } from "@/lib/data/orders";
import { errorMessage } from "@/lib/domain/errors";
import { periodLabel, periodRange, seoulToday, shiftPeriod, type PeriodKind } from "@/lib/domain/period";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { KpiStrip } from "./kpi-strip";
import { ProductTable } from "./product-table";
import { BestSellers, LeastSold } from "./ranking-lists";

const KINDS: PeriodKind[] = ["day", "week", "month", "year"];

export function AnalyticsScreen({ isOwner, meId }: { isOwner: boolean; meId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const today = seoulToday();
  const kind = (KINDS.includes(sp.get("p") as PeriodKind) ? sp.get("p") : "day") as PeriodKind;
  const anchor = /^\d{4}-\d{2}-\d{2}$/.test(sp.get("d") ?? "") ? sp.get("d")! : today;
  // Owner: "" = everyone, "me" = own, otherwise a seller id. Sellers are always scoped to themselves
  // by the database; the value sent is irrelevant for them.
  const scopeParam = isOwner ? (sp.get("s") ?? "") : "me";
  const sellerId = scopeParam === "" ? null : scopeParam === "me" ? meId : scopeParam;

  const range = periodRange(kind, anchor);
  const key = `${range.from}|${range.to}|${sellerId}`;
  const [report, setReport] = useState<{ key: string; data: Report } | null>(null);
  const [leastDays, setLeastDays] = useState<14 | 30>(14);
  const [least, setLeast] = useState<{ key: string; rows: LeastSoldRow[] } | null>(null);
  const [sellers, setSellers] = useState<{ id: string; full_name: string; username: string }[]>([]);

  useEffect(() => {
    if (isOwner) listSellers(supabaseBrowser()).then(setSellers).catch(() => {});
  }, [isOwner]);

  useEffect(() => {
    let cancelled = false;
    getReport(supabaseBrowser(), range.from, range.to, sellerId)
      .then((data) => !cancelled && setReport({ key, data }))
      .catch((e) => !cancelled && toast.error(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [key, range.from, range.to, sellerId]);

  const leastKey = `${leastDays}|${sellerId}`;
  useEffect(() => {
    let cancelled = false;
    getLeastSold(supabaseBrowser(), leastDays, sellerId)
      .then((rows) => !cancelled && setLeast({ key: leastKey, rows }))
      .catch((e) => !cancelled && toast.error(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [leastKey, leastDays, sellerId]);

  function go(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const current = report?.key === key ? report.data : null;
  const atToday = range.endYmd >= today;

  return (
    <>
      <PageHeader title={uz.analytics.title}>
        {isOwner ? (
          <label className="flex items-center gap-2 text-sm text-ink-2">
            {uz.analytics.scope}
            <select
              value={scopeParam}
              onChange={(e) => go({ s: e.target.value || undefined })}
              className="h-10 rounded-sm border border-input bg-cell px-2 text-sm font-semibold text-ink"
            >
              <option value="">{uz.analytics.all}</option>
              <option value="me">{uz.analytics.mine}</option>
              {sellers
                .filter((s) => s.id !== meId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.username}
                  </option>
                ))}
            </select>
          </label>
        ) : (
          <span className="caption">{uz.analytics.mineCaption}</span>
        )}
      </PageHeader>

      <div className="waybill mb-4 flex flex-wrap items-stretch">
        <div role="radiogroup" aria-label={uz.analytics.title} className="flex border-ink max-sm:w-full max-sm:border-b sm:border-r">
          {KINDS.map((k, i) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => go({ p: k, d: anchor })}
              className={cn(
                "h-11 flex-1 px-4 text-sm font-semibold transition-colors duration-150 sm:flex-none",
                i > 0 && "border-l border-ink",
                kind === k ? "bg-ink text-cell" : "hover:bg-paper",
              )}
            >
              {uz.analytics.periods[k]}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-1 px-2 py-1">
          <Button variant="ghost" size="icon" onClick={() => go({ d: shiftPeriod(kind, anchor, -1) })} aria-label={uz.analytics.prev}>
            <ChevronLeft aria-hidden />
          </Button>
          <p className="num min-w-40 flex-1 text-center text-base font-bold" aria-live="polite">
            {periodLabel(kind, anchor)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => go({ d: shiftPeriod(kind, anchor, 1) })}
            disabled={atToday}
            aria-label={uz.analytics.next}
          >
            <ChevronRight aria-hidden />
          </Button>
          <Button variant="outline" size="sm" onClick={() => go({ d: undefined })} disabled={anchor === today}>
            {uz.analytics.today}
          </Button>
        </div>
      </div>

      {current === null ? (
        <Skeleton className="mb-4 h-56 rounded-lg border border-ink" />
      ) : (
        <KpiStrip report={current} />
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {current === null ? (
          <Skeleton className="h-72 rounded-lg border border-ink" />
        ) : current.products.length === 0 ? (
          <div className="waybill px-4 py-12 text-center text-ink-2">{uz.analytics.empty}</div>
        ) : (
          <ProductTable products={current.products} />
        )}
        <div className="grid content-start gap-4">
          <BestSellers products={current?.products ?? []} />
          <LeastSold rows={least?.key === leastKey ? least.rows : null} days={leastDays} onDays={setLeastDays} />
        </div>
      </div>
    </>
  );
}
