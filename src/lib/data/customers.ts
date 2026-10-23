import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type CustomerSummary = { id: string; name: string | null; orderCount: number };

export async function lookupCustomer(sb: SupabaseClient<Database>, e164: string): Promise<CustomerSummary | null> {
  const { data, error } = await sb.from("customers").select("id, name").eq("phone", e164).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { count, error: countError } = await sb
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", data.id)
    .neq("status", "cancelled");
  if (countError) throw countError;
  return { id: data.id, name: data.name, orderCount: count ?? 0 };
}
