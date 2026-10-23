"use client";

import { useCallback, useEffect, useReducer } from "react";
import { cartReducer, cartTotals, type CartLine } from "@/lib/domain/cart";

const CART_KEY = "unity.cart";
const REQUEST_KEY = "unity.cart.request";

function loadLines(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

// The cart survives an accidental reload. Only render this hook client-side (the checkout
// screen is loaded with ssr: false), so reading sessionStorage during init is safe.
export function useCart() {
  const [lines, dispatch] = useReducer(cartReducer, undefined, loadLines);

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      // Storage full or blocked: the cart still works for this page view.
    }
  }, [lines]);

  // One idempotency key per order attempt, reused on every retry until the order succeeds,
  // and persisted so a reload after a lost response can't create a duplicate order.
  const requestId = useCallback((): string => {
    let id: string | null = null;
    try {
      id = sessionStorage.getItem(REQUEST_KEY);
    } catch {}
    if (!id) {
      id = crypto.randomUUID();
      try {
        sessionStorage.setItem(REQUEST_KEY, id);
      } catch {}
    }
    return id;
  }, []);

  const finishOrder = useCallback(() => {
    try {
      sessionStorage.removeItem(REQUEST_KEY);
    } catch {}
    dispatch({ type: "clear" });
  }, []);

  return { lines, dispatch, totals: cartTotals(lines), requestId, finishOrder };
}
