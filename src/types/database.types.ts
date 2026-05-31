export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      broker_connections: {
        Row: {
          connected_at: string | null;
          created_at: string;
          encrypted_tokens: string | null;
          id: string;
          provider: string;
          status: string;
          token_expires_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          connected_at?: string | null;
          created_at?: string;
          encrypted_tokens?: string | null;
          id?: string;
          provider: string;
          status?: string;
          token_expires_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          connected_at?: string | null;
          created_at?: string;
          encrypted_tokens?: string | null;
          id?: string;
          provider?: string;
          status?: string;
          token_expires_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: number;
          category: string;
          created_at: string;
          expense_date: string;
          id: string;
          note: string | null;
          payment_method: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          category: string;
          created_at?: string;
          expense_date: string;
          id?: string;
          note?: string | null;
          payment_method?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category?: string;
          created_at?: string;
          expense_date?: string;
          id?: string;
          note?: string | null;
          payment_method?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      income: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          income_date: string;
          note: string | null;
          source: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          income_date: string;
          note?: string | null;
          source?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          income_date?: string;
          note?: string | null;
          source?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      portfolio_snapshots: {
        Row: {
          created_at: string;
          current_value: number;
          id: string;
          invested: number;
          snapshot_date: string;
          unrealized_gain: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_value: number;
          id?: string;
          invested: number;
          snapshot_date: string;
          unrealized_gain: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_value?: number;
          id?: string;
          invested?: number;
          snapshot_date?: string;
          unrealized_gain?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          currency: string;
          email: string | null;
          id: string;
          locale: string;
          name: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          currency?: string;
          email?: string | null;
          id: string;
          locale?: string;
          name?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          currency?: string;
          email?: string | null;
          id?: string;
          locale?: string;
          name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      savings_goals: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          saved_amount: number;
          target_amount: number;
          target_date: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          saved_amount?: number;
          target_amount: number;
          target_date?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          saved_amount?: number;
          target_amount?: number;
          target_date?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      stock_holdings: {
        Row: {
          broker: string | null;
          buy_date: string;
          buy_price: number;
          created_at: string;
          id: string;
          quantity: number;
          source: string;
          symbol: string;
          user_id: string;
        };
        Insert: {
          broker?: string | null;
          buy_date: string;
          buy_price: number;
          created_at?: string;
          id?: string;
          quantity: number;
          source?: string;
          symbol: string;
          user_id: string;
        };
        Update: {
          broker?: string | null;
          buy_date?: string;
          buy_price?: number;
          created_at?: string;
          id?: string;
          quantity?: number;
          source?: string;
          symbol?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      stock_prices: {
        Row: {
          currency: string;
          current_price: number;
          previous_close: number | null;
          symbol: string;
          updated_at: string;
        };
        Insert: {
          currency?: string;
          current_price: number;
          previous_close?: number | null;
          symbol: string;
          updated_at?: string;
        };
        Update: {
          currency?: string;
          current_price?: number;
          previous_close?: number | null;
          symbol?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
