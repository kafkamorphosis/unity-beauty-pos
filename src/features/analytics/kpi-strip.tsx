import { Krw, Usd } from "@/components/money";
import type { Report } from "@/lib/data/analytics";
import type { PaymentMethod } from "@/lib/domain/types";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";

const METHODS: PaymentMethod[] = ["cash", "card", "transfer"];

function Cell({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("cell", className)}>
      <span className="caption">{label}</span>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function KpiStrip({ report }: { report: Report }) {
  const pay = new Map(report.by_payment.map((p) => [p.method, p]));
  return (
    <div className="waybill mb-4">
      <div className="grid sm:grid-cols-3 [&>*+*]:border-t [&>*+*]:border-ink sm:[&>*+*]:border-t-0 sm:[&>*+*]:border-l">
        <Cell label={uz.analytics.revenue}>
          <Krw value={report.revenue} className="monument block text-figure" />
        </Cell>
        <Cell label={uz.analytics.cost}>
          <Krw value={report.cost} className="monument block text-figure text-ink-2" />
        </Cell>
        <Cell label={uz.analytics.profit}>
          <Krw value={report.profit} className={cn("monument block text-figure", report.profit >= 0 ? "text-ok" : "text-danger")} />
        </Cell>
      </div>
      <div className="grid grid-cols-3 border-t border-ink [&>*+*]:border-l [&>*+*]:border-rule-soft">
        <Cell label={uz.analytics.orders}>
          <span className="num text-xl font-bold">{report.orders}</span>
        </Cell>
        <Cell label={uz.analytics.items}>
          <span className="num text-xl font-bold">{report.items}</span>
        </Cell>
        <Cell label={uz.analytics.shipping}>
          <Krw value={report.shipping_krw} className="block text-base font-bold" />
          <Usd value={report.shipping_usd} className="block text-base font-bold" />
        </Cell>
      </div>
      <div className="grid grid-cols-3 border-t border-ink bg-paper/60 [&>*+*]:border-l [&>*+*]:border-rule-soft">
        {METHODS.map((m) => (
          <Cell key={m} label={uz.payment[m]} className="bg-transparent">
            <Krw value={pay.get(m)?.revenue ?? 0} className="block text-base font-bold" />
            <span className="num text-xs text-ink-3">{uz.analytics.ordersCount(pay.get(m)?.orders ?? 0)}</span>
          </Cell>
        ))}
      </div>
    </div>
  );
}
