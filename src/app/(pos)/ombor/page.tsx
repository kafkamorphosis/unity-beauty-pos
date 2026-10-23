import type { Metadata } from "next";
import { Suspense } from "react";
import { InventoryScreen } from "@/features/inventory/inventory-screen";
import { uz } from "@/lib/i18n/uz";

export const metadata: Metadata = { title: uz.inventory.title };

export default function OmborPage() {
  return (
    <Suspense>
      <InventoryScreen />
    </Suspense>
  );
}
