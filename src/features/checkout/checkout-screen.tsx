"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, RotateCw, ScanBarcode } from "lucide-react";
import { toast } from "sonner";
import { CameraScanner } from "@/components/scanner/camera-scanner";
import { scanFeedback } from "@/components/scanner/feedback";
import { useHidScanner } from "@/components/scanner/use-hid-scanner";
import { useOnline } from "@/components/shell/use-online";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Order, Product } from "@/lib/database.types";
import { lookupCustomer, type CustomerSummary } from "@/lib/data/customers";
import { findProductByBarcode } from "@/lib/data/products";
import { getShippingRates } from "@/lib/data/settings";
import type { CartProduct } from "@/lib/domain/cart";
import { errorMessage } from "@/lib/domain/errors";
import { formatKrw } from "@/lib/domain/money";
import { normalizePhone } from "@/lib/domain/phone";
import type { ShippingRates } from "@/lib/domain/shipping";
import type { Destination } from "@/lib/domain/types";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uz } from "@/lib/i18n/uz";
import { CartRow } from "./cart-row";
import { CustomerPanel, type CustomerState } from "./customer-panel";
import { ProductSearch } from "./product-search";
import { SuccessDialog } from "./success-dialog";
import { TekpeDialog } from "./tekpe-dialog";
import { useCart } from "./use-cart";

const EMPTY_CUSTOMER: CustomerState = { country: "KR", phone: "", name: "", payment: "cash" };

function toCartProduct(p: Product): CartProduct {
  return {
    id: p.id,
    barcode: p.barcode,
    name: p.name,
    photoPath: p.photo_path,
    retailPrice: p.retail_price,
    wholesalePrice: p.wholesale_price,
    weightG: p.weight_g,
    stock: p.stock,
  };
}

type Attempt = { type: "store" } | { type: "tekpe"; destination: Destination };

function isNetworkError(e: { code?: string; message?: string }): boolean {
  return !e.code && /fetch|network/i.test(e.message ?? "");
}

export function CheckoutScreen() {
  const { lines, dispatch, totals, requestId, finishOrder } = useCart();
  const online = useOnline();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [customerState, setCustomerState] = useState<CustomerState>(EMPTY_CUSTOMER);
  const [lookup, setLookup] = useState<{ phone: string; result: CustomerSummary | null } | null>(null);
  const [rates, setRates] = useState<ShippingRates | null>(null);
  const [fresh, setFresh] = useState<{ id: string; n: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<Attempt | null>(null);
  const [success, setSuccess] = useState<Order | null>(null);
  const [tekpeOpen, setTekpeOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [camera, setCamera] = useState(false);

  const phone = normalizePhone(customerState.phone, customerState.country);
  const phoneDigits = customerState.phone.replace(/\D/g, "").length;
  const phoneInvalid = phoneDigits >= 9 && phone === null;
  const customer = phone && lookup?.phone === phone ? lookup.result : undefined;
  const dialogOpen = tekpeOpen || success !== null || camera;
  const empty = lines.length === 0;

  useEffect(() => {
    getShippingRates(supabaseBrowser()).then(setRates).catch((e) => toast.error(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (!phone) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await lookupCustomer(supabaseBrowser(), phone).catch(() => null);
      if (cancelled) return;
      setLookup({ phone, result });
      if (result?.name) setCustomerState((s) => (s.name.trim() ? s : { ...s, name: result.name ?? "" }));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phone]);

  function addProduct(p: Product) {
    dispatch({ type: "add", product: toCartProduct(p) });
    setFresh((f) => ({ id: p.id, n: (f?.n ?? 0) + 1 }));
  }

  async function addByBarcode(code: string) {
    try {
      const product = await findProductByBarcode(supabaseBrowser(), code);
      if (!product) {
        scanFeedback(false);
        toast.error(`${uz.checkout.notFound}: ${code}`, {
          action: { label: uz.checkout.addToInventory, onClick: () => router.push("/ombor") },
        });
        return;
      }
      scanFeedback(true);
      addProduct(product);
    } catch (e) {
      scanFeedback(false);
      toast.error(errorMessage(e));
    }
  }

  useHidScanner(addByBarcode, { enabled: !dialogOpen });

  async function submit(attempt: Attempt) {
    if (empty || busy) return;
    if (customerState.phone.trim() && !phone) {
      toast.error(uz.checkout.phoneInvalid);
      return;
    }
    setBusy(true);
    setFailed(null);
    const { data, error } = await supabaseBrowser().rpc("create_order", {
      p_request_id: requestId(),
      p_items: lines.map((l) => ({ product_id: l.id, qty: l.qty, is_wholesale: l.isWholesale })),
      p_customer_phone: phone,
      p_customer_name: customerState.name.trim() || null,
      p_payment_method: customerState.payment,
      p_type: attempt.type,
      p_destination: attempt.type === "tekpe" ? attempt.destination : null,
    });
    setBusy(false);
    if (error) {
      if (isNetworkError(error)) setFailed(attempt);
      else toast.error(errorMessage(error));
      return;
    }
    // The order exists now: drop the cart and its request key right away, so leaving Kassa
    // without pressing "Yangi buyurtma" can't resubmit (and silently return) this order.
    finishOrder();
    setTekpeOpen(false);
    setSheetOpen(false);
    setSuccess(data);
  }

  function newOrder() {
    setSuccess(null);
    setCustomerState((s) => ({ ...EMPTY_CUSTOMER, payment: s.payment }));
    setLookup(null);
    setFresh(null);
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "F9" && !dialogOpen) {
        e.preventDefault();
        submit({ type: "store" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const panel = (
    <CustomerPanel
      state={customerState}
      onChange={(patch) => setCustomerState((s) => ({ ...s, ...patch }))}
      customer={customer}
      phoneInvalid={phoneInvalid}
      totals={totals}
      busy={busy}
      disabled={empty || !online}
      onCheckout={() => submit({ type: "store" })}
      onTekpe={() => setTekpeOpen(true)}
    />
  );

  return (
    <div className="waybill grid flex-1 lg:grid-cols-[minmax(0,1fr)_25rem]">
      <section className="flex min-w-0 flex-col lg:border-r lg:border-ink" aria-label={uz.checkout.title}>
        <div className="flex items-center gap-2 border-b border-ink p-2">
          <ProductSearch ref={searchRef} onPick={addProduct} onBarcode={addByBarcode} />
          <Button variant="outline" size="icon" className="size-11" onClick={() => setCamera(true)} aria-label={uz.common.camera}>
            <Camera aria-hidden />
          </Button>
          <span className="hidden items-center gap-1.5 px-2 text-xs font-semibold whitespace-nowrap text-ok xl:flex">
            <span className="size-2 rounded-full bg-ok" aria-hidden />
            {uz.scanner.ready}
          </span>
        </div>

        {failed && (
          <div role="alert" className="flex flex-wrap items-center gap-3 border-b border-ink bg-warn-soft px-3 py-2.5 text-sm font-medium text-warn">
            {uz.checkout.networkError}
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => submit(failed)} disabled={busy}>
              <RotateCw aria-hidden />
              {uz.common.retry}
            </Button>
          </div>
        )}

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <ScanBarcode className="size-14 text-ink-3" strokeWidth={1.25} aria-hidden />
            <p className="text-xl font-bold">{uz.checkout.emptyTitle}</p>
            <p className="text-ink-2">{uz.checkout.emptyHint}</p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[2rem_2.75rem_minmax(0,1fr)_7rem_5rem_8rem_7.5rem_2.5rem] gap-3 border-b border-ink bg-paper px-3 py-1.5 xl:grid">
              <span className="caption">{uz.sheet.no}</span>
              <span />
              <span className="caption">{uz.sheet.product}</span>
              <span className="caption text-right">{uz.sheet.unitPrice}</span>
              <span className="caption">{uz.checkout.optom}</span>
              <span className="caption">{uz.sheet.qty}</span>
              <span className="caption text-right">{uz.sheet.lineTotal}</span>
              <span />
            </div>
            <ol className="flex-1 overflow-y-auto pb-28 lg:pb-0">
              {lines.map((line, i) => {
                const isFresh = fresh?.id === line.id;
                return (
                  <CartRow
                    key={isFresh ? `${line.id}-${fresh.n}` : line.id}
                    line={line}
                    index={i}
                    fresh={isFresh}
                    dispatch={dispatch}
                  />
                );
              })}
            </ol>
          </>
        )}
      </section>

      <aside className="hidden lg:block">{panel}</aside>

      {/* Phone/tablet: sticky total strip above the bottom nav opens the panel as a sheet. */}
      <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-3 border-t border-ink bg-cell px-3 py-2 md:bottom-0 lg:hidden">
        <div className="min-w-0 flex-1">
          <span className="caption">
            {uz.checkout.total} · {totals.itemCount} {uz.common.pcs}
          </span>
          <p className="monument text-2xl">{formatKrw(totals.subtotal)}</p>
        </div>
        <Button size="lg" onClick={() => setSheetOpen(true)} disabled={empty}>
          {uz.checkout.continue}
        </Button>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[92dvh] gap-0 overflow-y-auto border-t border-ink p-0">
          <SheetHeader className="border-b border-ink px-4 py-3">
            <SheetTitle>{uz.checkout.title}</SheetTitle>
            <SheetDescription className="sr-only">{uz.checkout.payment}</SheetDescription>
          </SheetHeader>
          {panel}
        </SheetContent>
      </Sheet>

      <TekpeDialog
        open={tekpeOpen}
        onOpenChange={setTekpeOpen}
        state={customerState}
        onChange={(patch) => setCustomerState((s) => ({ ...s, ...patch }))}
        totals={totals}
        rates={rates}
        busy={busy}
        onConfirm={(destination) => submit({ type: "tekpe", destination })}
      />
      <SuccessDialog order={success} onNewOrder={newOrder} />
      <CameraScanner open={camera} onClose={() => setCamera(false)} onScan={addByBarcode} continuous />
    </div>
  );
}
