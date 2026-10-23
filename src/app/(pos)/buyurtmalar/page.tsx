import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersScreen } from "@/features/orders/orders-screen";
import { uz } from "@/lib/i18n/uz";

export const metadata: Metadata = { title: uz.orders.title };

export default function BuyurtmalarPage() {
  return (
    <Suspense>
      <OrdersScreen />
    </Suspense>
  );
}
