import type { Metadata } from "next";
import { NotificationsScreen } from "@/features/notifications/notifications-screen";
import { uz } from "@/lib/i18n/uz";

export const metadata: Metadata = { title: uz.notifications.title };

export default function BildirishnomalarPage() {
  return <NotificationsScreen />;
}
