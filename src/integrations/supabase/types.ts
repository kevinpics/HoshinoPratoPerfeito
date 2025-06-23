export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      coupon_uses: {
        Row: {
          coupon_id: string;
          discount_amount: number;
          id: string;
          order_id: string;
          used_at: string;
          user_id: string;
        };
        Insert: {
          coupon_id: string;
          discount_amount: number;
          id?: string;
          order_id: string;
          used_at?: string;
          user_id: string;
        };
        Update: {
          coupon_id?: string;
          discount_amount?: number;
          id?: string;
          order_id?: string;
          used_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_uses_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupon_uses_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      coupons: {
        Row: {
          code: string;
          created_at: string;
          current_uses: number | null;
          description: string | null;
          discount_type: string;
          discount_value: number;
          expires_at: string | null;
          id: string;
          is_active: boolean | null;
          max_uses: number | null;
          min_order_value: number | null;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          current_uses?: number | null;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_uses?: number | null;
          min_order_value?: number | null;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          current_uses?: number | null;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_uses?: number | null;
          min_order_value?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_zones: {
        Row: {
          created_at: string;
          estimated_time: number;
          fee: number;
          id: string;
          is_active: boolean | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          estimated_time?: number;
          fee?: number;
          id?: string;
          is_active?: boolean | null;
          name: string;
        };
        Update: {
          created_at?: string;
          estimated_time?: number;
          fee?: number;
          id?: string;
          is_active?: boolean | null;
          name?: string;
        };
        Relationships: [];
      };
      loyalty_points: {
        Row: {
          created_at: string;
          id: string;
          points: number | null;
          total_orders: number | null;
          updated_at: string;
          p_user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          points?: number | null;
          total_orders?: number | null;
          updated_at?: string;
          p_user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          points?: number | null;
          total_orders?: number | null;
          updated_at?: string;
          p_user_id?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          extras: Json | null;
          id: string;
          order_id: string | null;
          product_id: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
        };
        Insert: {
          created_at?: string;
          extras?: Json | null;
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
        };
        Update: {
          created_at?: string;
          extras?: Json | null;
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          product_name?: string;
          product_price?: number;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          coupon_code: string | null;
          created_at: string;
          customer_address: string | null;
          customer_email: string | null;
          customer_name: string;
          customer_phone: string;
          delivery_fee: number | null;
          delivery_type: string;
          discount_amount: number | null;
          estimated_time: number | null;
          id: string;
          notes: string | null;
          order_date: string;
          payment_method: string;
          status: string;
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          coupon_code?: string | null;
          created_at?: string;
          customer_address?: string | null;
          customer_email?: string | null;
          customer_name: string;
          customer_phone: string;
          delivery_fee?: number | null;
          delivery_type: string;
          discount_amount?: number | null;
          estimated_time?: number | null;
          id?: string;
          notes?: string | null;
          order_date?: string;
          payment_method: string;
          status?: string;
          total_amount: number;
          updated_at?: string;
        };
        Update: {
          coupon_code?: string | null;
          created_at?: string;
          customer_address?: string | null;
          customer_email?: string | null;
          customer_name?: string;
          customer_phone?: string;
          delivery_fee?: number | null;
          delivery_type?: string;
          discount_amount?: number | null;
          estimated_time?: number | null;
          id?: string;
          notes?: string | null;
          order_date?: string;
          payment_method?: string;
          status?: string;
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_extras: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          price: number;
          product_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          price: number;
          product_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          price?: number;
          product_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_extras_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          product_id: string;
          rating: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          product_id: string;
          rating: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          product_id?: string;
          rating?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          image: string | null;
          is_available: boolean | null;
          is_highlight: boolean | null;
          name: string;
          original_price: number | null;
          price: number;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image?: string | null;
          is_available?: boolean | null;
          is_highlight?: boolean | null;
          name: string;
          original_price?: number | null;
          price: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image?: string | null;
          is_available?: boolean | null;
          is_highlight?: boolean | null;
          name?: string;
          original_price?: number | null;
          price?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_product_rating: {
        Args: { product_id: string };
        Returns: {
          average_rating: number;
          total_reviews: number;
        }[];
      };
      get_user_role: {
        Args: { user_id: string };
        Returns: string;
      };
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      update_loyalty_points: {
        Args: { p_user_id: string; p_order_total: number };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
