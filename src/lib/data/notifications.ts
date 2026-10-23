import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Product } from "@/lib/database.types";

type SB = SupabaseClient<Database>;

// Most urgent first: furthest below the threshold, then by name.
export async function listLowStock(sb: SB): Promise<Product[]> {
  const { data, error } = await sb.from("low_stock_products").select("*");
  if (error) throw error;
  return data.sort((a, b) => a.stock - a.low_stock_threshold - (b.stock - b.low_stock_threshold) || a.name.localeCompare(b.name, "uz"));
}

export async function countLowStock(sb: SB): Promise<number> {
  const { count, error } = await sb.from("low_stock_products").select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
