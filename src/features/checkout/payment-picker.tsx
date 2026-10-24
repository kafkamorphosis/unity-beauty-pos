import type { PaymentMethod } from "@/lib/domain/types";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";

const METHODS: PaymentMethod[] = ["cash", "card", "transfer"];

export function PaymentPicker({ id, value, onChange }: { id: string; value: PaymentMethod; onChange(m: PaymentMethod): void }) {
  return (
    <div className="cell border-b border-ink">
      <span className="caption" id={id}>
        {uz.checkout.payment}
      </span>
      <div role="radiogroup" aria-labelledby={id} className="mt-1 grid grid-cols-3 overflow-hidden rounded-sm border border-ink">
        {METHODS.map((m, i) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={value === m}
            onClick={() => onChange(m)}
            className={cn(
              "h-11 text-sm font-semibold transition-colors duration-150",
              i > 0 && "border-l border-ink",
              value === m ? "bg-ink text-cell" : "bg-cell hover:bg-paper",
            )}
          >
            {uz.payment[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
