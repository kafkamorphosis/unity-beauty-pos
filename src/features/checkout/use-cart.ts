"use client";

import { useCallback, useEffect, useReducer } from "react";
import { cartReducer, cartTotals, type CartLine } from "@/lib/domain/cart";
import type { StoredRequest } from "./request-key";

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

  // The idempotency key of the last attempt plus a fingerprint of what it sent, persisted so a
  // reload after a lost response can still tell a retry from a changed cart (see request-key.ts).
  const loadRequest = useCallback((): StoredRequest => {
    try {
      const raw = sessionStorage.getItem(REQUEST_KEY);
      const parsed = raw ? (JSON.parse(raw) as StoredRequest) : null;
      return parsed && typeof parsed.id === "string" && typeof parsed.fp === "string" ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  const saveRequest = useCallback((r: StoredRequest) => {
    try {
      if (r) sessionStorage.setItem(REQUEST_KEY, JSON.stringify(r));
      else sessionStorage.removeItem(REQUEST_KEY);
    } catch {}
  }, []);

  const finishOrder = useCallback(() => {
    saveRequest(null);
    dispatch({ type: "clear" });
  }, [saveRequest]);

  return { lines, dispatch, totals: cartTotals(lines), loadRequest, saveRequest, finishOrder };
}
