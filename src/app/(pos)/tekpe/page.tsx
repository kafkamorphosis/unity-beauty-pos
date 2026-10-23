import type { Metadata } from "next";
import { TekpeScreen } from "@/features/tekpe/tekpe-screen";
import { uz } from "@/lib/i18n/uz";

export const metadata: Metadata = { title: uz.tekpe.title };

export default function TekpePage() {
  return <TekpeScreen />;
}
