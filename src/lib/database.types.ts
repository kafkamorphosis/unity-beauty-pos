// Generated with Supabase MCP generate_typescript_types (project zeekxqinioeyrjyhuajw), trimmed to
// the Database type. Regenerate after every migration.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type OrderRow = {
  cancelled_at: string | null;
  cancelled_by: string | null;
  cost_total: number;
  created_at: string;
  customer_id: string | null;
  destination: Database["public"]["Enums"]["destination"] | null;
  id: string;
  item_count: number;
  line_count: number;
  order_no: number;
  payment_method: Database["public"]["Enums"]["payment_method"];
  picked_up_at: string | null;
  picked_up_by: string | null;
  qr_token: string;
  ready_at: string | null;
  ready_by: string | null;
  request_id: string;
  seller_id: string;
  shipping_kg: number;
  shipping_krw: number;
  shipping_usd: number;
  status: Database["public"]["Enums"]["order_status"];
  subtotal: number;
  total_weight_g: number;
  type: Database["public"]["Enums"]["order_type"];
};

type ProductRow = {
  barcode: string;
  cost_price: number;
  created_at: string;
  id: string;
  is_archived: boolean;
  low_stock_threshold: number;
  name: string;
  photo_path: string | null;
  retail_price: number;
  stock: number;
  updated_at: string;
  weight_g: number;
  wholesale_price: number;
};

type Rel = { foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] };

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      app_settings: {
        Row: { id: boolean; kr_shipping_krw: number; updated_at: string; uz_shipping_usd_per_kg: number };
        Insert: { id?: boolean; kr_shipping_krw?: number; updated_at?: string; uz_shipping_usd_per_kg?: number };
        Update: { id?: boolean; kr_shipping_krw?: number; updated_at?: string; uz_shipping_usd_per_kg?: number };
        Relationships: [];
      };
      customers: {
        Row: { created_at: string; id: string; name: string | null; phone: string };
        Insert: { created_at?: string; id?: string; name?: string | null; phone: string };
        Update: { created_at?: string; id?: string; name?: string | null; phone?: string };
        Relationships: [];
      };
      order_items: {
        Row: {
          barcode: string;
          id: string;
          is_wholesale: boolean;
          line_total: number;
          line_weight_g: number;
          name: string;
          order_id: string;
          photo_path: string | null;
          product_id: string;
          qty: number;
          unit_cost: number;
          unit_price: number;
          unit_weight_g: number;
        };
        Insert: never;
        Update: never;
        Relationships: [
          { foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "order_items_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      orders: {
        Row: OrderRow;
        Insert: never;
        Update: never;
        Relationships: [
          { foreignKeyName: "orders_cancelled_by_fkey"; columns: ["cancelled_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "customers"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_picked_up_by_fkey"; columns: ["picked_up_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_ready_by_fkey"; columns: ["ready_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      products: {
        Row: ProductRow;
        Insert: {
          barcode: string;
          cost_price?: number;
          low_stock_threshold?: number;
          name: string;
          photo_path?: string | null;
          retail_price?: number;
          weight_g?: number;
          wholesale_price?: number;
        };
        Update: {
          cost_price?: number;
          is_archived?: boolean;
          low_stock_threshold?: number;
          name?: string;
          photo_path?: string | null;
          retail_price?: number;
          weight_g?: number;
          wholesale_price?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["app_role"];
          username: string;
        };
        Insert: never;
        Update: { full_name?: string; is_active?: boolean; role?: Database["public"]["Enums"]["app_role"] };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          cost_price: number | null;
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["movement_kind"];
          order_id: string | null;
          product_id: string;
          qty_change: number;
          user_id: string;
        };
        Insert: never;
        Update: never;
        Relationships: Rel[];
      };
    };
    Views: {
      inventory_summary: {
        Row: { cost_value: number | null; retail_value: number | null; wholesale_value: number | null };
        Relationships: [];
      };
    };
    Functions: {
      adjust_stock: { Args: { p_new_stock: number; p_product_id: string; p_expected_stock?: number }; Returns: ProductRow };
      change_stock: { Args: { p_delta: number; p_product_id: string }; Returns: ProductRow };
      app_role: { Args: never; Returns: Database["public"]["Enums"]["app_role"] };
      cancel_order: { Args: { p_order_id: string }; Returns: OrderRow };
      create_order: {
        Args: {
          p_customer_name: string | null;
          p_customer_phone: string | null;
          p_destination: Database["public"]["Enums"]["destination"] | null;
          p_items: Json;
          p_payment_method: Database["public"]["Enums"]["payment_method"];
          p_request_id: string;
          p_type: Database["public"]["Enums"]["order_type"];
        };
        Returns: OrderRow;
      };
      restock_product: { Args: { p_cost_price?: number; p_product_id: string; p_qty: number }; Returns: ProductRow };
      set_order_status: {
        Args: { p_order_id: string; p_status: Database["public"]["Enums"]["order_status"] };
        Returns: OrderRow;
      };
    };
    Enums: {
      app_role: "admin" | "owner" | "seller";
      destination: "KR" | "UZ";
      movement_kind: "restock" | "sale" | "cancel" | "adjust";
      order_status: "completed" | "new" | "ready" | "picked_up" | "cancelled";
      order_type: "store" | "tekpe";
      payment_method: "cash" | "card" | "transfer";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Product = Tables<"products">;
export type Profile = Tables<"profiles">;
