"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/domain/errors";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";

const STEP = 10;

// Bar length is an exact proportion: the low-stock line sits at one third of the track,
// so a product at its threshold fills exactly to the line.
export function StockBar({ stock, threshold }: { stock: number; threshold: number }) {
  const full = Math.max(threshold, 1) * 3;
  const pct = Math.max(0, Math.min(1, stock / full)) * 100;
  const low = stock <= threshold;
  return (
    <span className="relative block h-1 w-full bg-rule-soft" aria-hidden>
      <span className={cn("absolute inset-y-0 left-0", low ? "bg-warn" : "bg-ink")} style={{ width: `${pct}%` }} />
      <span className="absolute inset-y-[-2px] left-1/3 w-px bg-ink-3" />
    </span>
  );
}

export function StockStepper({
  productId,
  stock,
  threshold,
  onChange,
}: {
  productId: string;
  stock: number;
  threshold: number;
  onChange?: (newStock: number) => void;
}) {
  const [value, setValue] = useState(stock);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Follow realtime updates from other devices without an effect.
  const [seenStock, setSeenStock] = useState(stock);
  if (stock !== seenStock) {
    setSeenStock(stock);
    setValue(stock);
  }
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  async function run(call: () => PromiseLike<{ data: { stock: number } | null; error: { message?: string } | null }>, optimistic: number) {
    const previous = value;
    setValue(optimistic);
    setBusy(true);
    const { data, error } = await call();
    if (error) {
      setValue(previous);
      toast.error(errorMessage(error));
      if (error.message === "STOCK_CHANGED") {
        const { data: fresh } = await supabaseBrowser().from("products").select("stock").eq("id", productId).single();
        if (fresh) setValue(fresh.stock);
      }
    } else if (data) {
      setValue(data.stock);
      onChange?.(data.stock);
    }
    setBusy(false);
  }

  // ±10 is a relative change applied to the current stock on the server, so sales made on other
  // devices since this screen last refreshed are never overwritten.
  function step(delta: number) {
    run(
      () => supabaseBrowser().rpc("change_stock", { p_product_id: productId, p_delta: delta }),
      Math.max(value + delta, Math.min(value, 0)),
    );
  }

  // A typed exact value carries the stock it replaces; the server refuses if it moved meanwhile.
  function commit(next: number) {
    const target = Math.max(0, Math.floor(next));
    if (!Number.isFinite(target) || target === value) return;
    run(
      () => supabaseBrowser().rpc("adjust_stock", { p_product_id: productId, p_new_stock: target, p_expected_stock: value }),
      target,
    );
  }

  const low = value <= threshold;

  return (
    <div className="flex w-44 flex-col gap-1.5">
      <div className="flex h-9 items-stretch overflow-hidden rounded-sm border border-ink">
        <button
          type="button"
          onClick={() => step(-STEP)}
          disabled={busy || value <= 0}
          aria-label={`−${STEP}`}
          className="flex w-12 items-center justify-center gap-0.5 border-r border-ink text-xs font-bold hover:bg-paper disabled:opacity-40"
        >
          <Minus className="size-3" aria-hidden />
          {STEP}
        </button>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            inputMode="numeric"
            aria-label={uz.inventory.stock}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
            onBlur={() => {
              setEditing(false);
              if (draft !== "") commit(Number(draft));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setDraft("");
                setEditing(false);
              }
            }}
            className="num min-w-0 flex-1 bg-sand-soft text-center text-base font-bold outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
            className={cn("num flex-1 text-base font-bold hover:bg-paper", low && "text-warn")}
            aria-label={`${uz.inventory.stock}: ${value}`}
          >
            {value}
          </button>
        )}
        <button
          type="button"
          onClick={() => step(STEP)}
          disabled={busy}
          aria-label={`+${STEP}`}
          className="flex w-12 items-center justify-center gap-0.5 border-l border-ink text-xs font-bold hover:bg-paper disabled:opacity-40"
        >
          <Plus className="size-3" aria-hidden />
          {STEP}
        </button>
      </div>
      <StockBar stock={value} threshold={threshold} />
    </div>
  );
}
