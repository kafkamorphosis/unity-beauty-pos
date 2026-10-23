import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Order, OrderItem } from "@/lib/database.types";

type SB = SupabaseClient<Database>;

export type OrderWithItems = Order & {
  items: OrderItem[];
  customer: { name: string | null; phone: string } | null;
  seller: { full_name: string } | null;
};

const ORDER_WITH_ITEMS =
  "*, items:order_items(*), customer:customers(name, phone), seller:profiles!orders_seller_id_fkey(full_name)" as const;

export async function getOrderWithItems(sb: SB, id: string): Promise<OrderWithItems | null> {
  const { data, error } = await sb.from("orders").select(ORDER_WITH_ITEMS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const order = data as unknown as OrderWithItems;
  order.items.sort((a, b) => a.name.localeCompare(b.name, "uz"));
  return order;
}
