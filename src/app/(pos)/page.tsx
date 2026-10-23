import type { Metadata } from "next";
import { CheckoutLoader } from "@/features/checkout/checkout-loader";
import { uz } from "@/lib/i18n/uz";

export const metadata: Metadata = { title: uz.checkout.title };

export default function KassaPage() {
  return <CheckoutLoader />;
}
