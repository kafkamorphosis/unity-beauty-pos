import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutoPrint } from "@/features/print/autoprint";
import { OrderSheet } from "@/features/print/order-sheet";
import { PrintButton } from "@/features/print/print-button";
import { requireRole } from "@/lib/auth/session";
import { getOrderWithItems } from "@/lib/data/orders";
import { formatOrderNo } from "@/lib/domain/order-no";
import { supabaseServer } from "@/lib/supabase/server";
import { uz } from "@/lib/i18n/uz";
import "./print.css";

export async function generateMetadata({ params }: PageProps<"/print/[id]">): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderWithItems(await supabaseServer(), id).catch(() => null);
  return { title: { absolute: order ? formatOrderNo(order.order_no) : uz.sheet.notFound } };
}

export default async function PrintPage({ params, searchParams }: PageProps<"/print/[id]">) {
  await requireRole(["manager"]);
  const { id } = await params;
  const { autoprint } = await searchParams;
  const order = await getOrderWithItems(await supabaseServer(), id).catch(() => null);
  if (!order) notFound();
  const qr = await QRCode.toDataURL(order.qr_token, { margin: 1, width: 240, errorCorrectionLevel: "M" });

  return (
    <div className="print-root min-h-dvh px-3 py-6">
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link href={`/buyurtmalar/${order.id}`}>
            <ArrowLeft aria-hidden />
            {uz.sheet.backToOrder}
          </Link>
        </Button>
        <PrintButton />
      </div>
      <OrderSheet order={order} qrDataUrl={qr} />
      <AutoPrint enabled={autoprint === "1"} />
    </div>
  );
}
