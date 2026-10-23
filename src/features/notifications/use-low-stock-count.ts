"use client";

import { useEffect, useState } from "react";
import { countLowStock } from "@/lib/data/notifications";
import { supabaseBrowser } from "@/lib/supabase/client";

// Live count for the nav badge: product changes on any device, reconnects and window focus refresh it.
export function useLowStockCount(enabled: boolean): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const sb = supabaseBrowser();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () =>
      countLowStock(sb)
        .then(setCount)
        .catch(() => {});
    const channel = sb
      .channel("low-stock-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        clearTimeout(timer);
        timer = setTimeout(refresh, 400);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") refresh();
      });
    const onFocus = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      sb.removeChannel(channel);
    };
  }, [enabled]);

  return enabled ? count : null;
}
