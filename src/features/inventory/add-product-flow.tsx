"use client";

import { useState } from "react";
import { Camera, Loader2, ScanBarcode } from "lucide-react";
import { toast } from "sonner";
import { CameraScanner } from "@/components/scanner/camera-scanner";
import { useHidScanner } from "@/components/scanner/use-hid-scanner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/database.types";
import { findProductByBarcode } from "@/lib/data/products";
import { errorMessage } from "@/lib/domain/errors";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uz } from "@/lib/i18n/uz";
import { ProductForm } from "./product-form";
import { RestockPanel } from "./restock-panel";

type Step = { kind: "scan" } | { kind: "restock"; product: Product } | { kind: "new"; barcode: string };

export function AddProductFlow({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange(o: boolean): void; onSaved(): void }) {
  const [step, setStep] = useState<Step>({ kind: "scan" });
  const [code, setCode] = useState("");
  const [looking, setLooking] = useState(false);
  const [camera, setCamera] = useState(false);

  function close() {
    onOpenChange(false);
    setStep({ kind: "scan" });
    setCode("");
  }

  async function lookup(raw: string) {
    const barcode = raw.trim();
    if (!barcode || looking) return;
    setCode(barcode);
    setLooking(true);
    try {
      const product = await findProductByBarcode(supabaseBrowser(), barcode);
      setStep(product ? { kind: "restock", product } : { kind: "new", barcode });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLooking(false);
    }
  }

  useHidScanner(lookup, { enabled: open && step.kind === "scan" && !camera });

  function done() {
    onSaved();
    close();
  }

  const title =
    step.kind === "restock" ? uz.inventory.restockTitle : step.kind === "new" ? uz.inventory.newProductTitle : uz.inventory.add;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
        <DialogContent className="gap-0 overflow-hidden border border-ink p-0 max-sm:max-h-dvh max-sm:overflow-y-auto sm:max-w-xl">
          <DialogHeader className="border-b border-ink px-4 py-3">
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </DialogHeader>

          {step.kind === "scan" && (
            <form
              className="grid"
              onSubmit={(e) => {
                e.preventDefault();
                lookup(code);
              }}
            >
              <div className="flex flex-col items-center gap-2 border-b border-ink px-4 py-8 text-center">
                <ScanBarcode className="size-10 text-ink-3" aria-hidden />
                <p className="text-base font-semibold">{uz.inventory.scanOrType}</p>
              </div>
              <label className="cell border-b border-ink">
                <span className="caption">{uz.inventory.barcode}</span>
                <span className="mt-1 flex gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoFocus
                    inputMode="numeric"
                    autoComplete="off"
                    className="num text-lg font-semibold tracking-wider"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => setCamera(true)} aria-label={uz.common.camera}>
                    <Camera aria-hidden />
                  </Button>
                </span>
              </label>
              <div className="cell flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={close}>
                  {uz.common.cancel}
                </Button>
                <Button type="submit" disabled={!code.trim() || looking}>
                  {looking && <Loader2 className="animate-spin" aria-hidden />}
                  {uz.inventory.next}
                </Button>
              </div>
            </form>
          )}

          {step.kind === "restock" && (
            <RestockPanel product={step.product} onDone={done} onCancel={() => setStep({ kind: "scan" })} />
          )}
          {step.kind === "new" && (
            <ProductForm barcode={step.barcode} onSaved={done} onCancel={() => setStep({ kind: "scan" })} />
          )}
        </DialogContent>
      </Dialog>
      <CameraScanner open={camera} onClose={() => setCamera(false)} onScan={lookup} />
    </>
  );
}
