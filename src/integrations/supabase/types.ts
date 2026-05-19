export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      breeds: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      horse_breeding: {
        Row: {
          breed_id: number
          created_at: string
          horse_id: number
          id: number
          percentage: number
        }
        Insert: {
          breed_id: number
          created_at?: string
          horse_id: number
          id?: number
          percentage: number
        }
        Update: {
          breed_id?: number
          created_at?: string
          horse_id?: number
          id?: number
          percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "horse_breeding_breed_id_fkey"
            columns: ["breed_id"]
            isOneToOne: false
            referencedRelation: "breeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horse_breeding_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horse_categories: {
        Row: {
          category: string
          created_at: string
          horse_id: number
          id: number
        }
        Insert: {
          category: string
          created_at?: string
          horse_id: number
          id?: number
        }
        Update: {
          category?: string
          created_at?: string
          horse_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "horse_categories_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horse_distances: {
        Row: {
          created_at: string
          distance: Database["public"]["Enums"]["distance_type"]
          horse_id: number
          id: number
        }
        Insert: {
          created_at?: string
          distance: Database["public"]["Enums"]["distance_type"]
          horse_id: number
          id?: number
        }
        Update: {
          created_at?: string
          distance?: Database["public"]["Enums"]["distance_type"]
          horse_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "horse_distances_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horse_positions: {
        Row: {
          created_at: string
          horse_id: number
          id: number
          position: Database["public"]["Enums"]["position_type"]
        }
        Insert: {
          created_at?: string
          horse_id: number
          id?: number
          position: Database["public"]["Enums"]["position_type"]
        }
        Update: {
          created_at?: string
          horse_id?: number
          id?: number
          position?: Database["public"]["Enums"]["position_type"]
        }
        Relationships: [
          {
            foreignKeyName: "horse_positions_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horse_surfaces: {
        Row: {
          created_at: string
          horse_id: number
          id: number
          surface: Database["public"]["Enums"]["surface_type"]
        }
        Insert: {
          created_at?: string
          horse_id: number
          id?: number
          surface: Database["public"]["Enums"]["surface_type"]
        }
        Update: {
          created_at?: string
          horse_id?: number
          id?: number
          surface?: Database["public"]["Enums"]["surface_type"]
        }
        Relationships: [
          {
            foreignKeyName: "horse_surfaces_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horse_traits: {
        Row: {
          created_at: string
          horse_id: number
          id: number
          trait_category: Database["public"]["Enums"]["trait_category_type"]
          trait_name: string
          trait_value: string | null
        }
        Insert: {
          created_at?: string
          horse_id: number
          id?: number
          trait_category: Database["public"]["Enums"]["trait_category_type"]
          trait_name: string
          trait_value?: string | null
        }
        Update: {
          created_at?: string
          horse_id?: number
          id?: number
          trait_category?: Database["public"]["Enums"]["trait_category_type"]
          trait_name?: string
          trait_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "horse_traits_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horses: {
        Row: {
          acceleration: number | null
          agility: number | null
          category: string | null
          created_at: string
          diet_acceleration: number | null
          diet_agility: number | null
          diet_jump: number | null
          diet_speed: number | null
          diet_sprint_energy: number | null
          gender: string | null
          id: number
          jump: number | null
          max_acceleration: boolean | null
          max_agility: boolean | null
          max_jump: boolean | null
          max_speed: boolean | null
          max_sprint_energy: boolean | null
          name: string
          notes: string | null
          speed: number | null
          sprint_energy: number | null
          tier: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          acceleration?: number | null
          agility?: number | null
          category?: string | null
          created_at?: string
          diet_acceleration?: number | null
          diet_agility?: number | null
          diet_jump?: number | null
          diet_speed?: number | null
          diet_sprint_energy?: number | null
          gender?: string | null
          id?: number
          jump?: number | null
          max_acceleration?: boolean | null
          max_agility?: boolean | null
          max_jump?: boolean | null
          max_speed?: boolean | null
          max_sprint_energy?: boolean | null
          name: string
          notes?: string | null
          speed?: number | null
          sprint_energy?: number | null
          tier?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          acceleration?: number | null
          agility?: number | null
          category?: string | null
          created_at?: string
          diet_acceleration?: number | null
          diet_agility?: number | null
          diet_jump?: number | null
          diet_speed?: number | null
          diet_sprint_energy?: number | null
          gender?: string | null
          id?: number
          jump?: number | null
          max_acceleration?: boolean | null
          max_agility?: boolean | null
          max_jump?: boolean | null
          max_speed?: boolean | null
          max_sprint_energy?: boolean | null
          name?: string
          notes?: string | null
          speed?: number | null
          sprint_energy?: number | null
          tier?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      live_races: {
        Row: {
          created_at: string
          distance: string
          end_time: string | null
          id: number
          is_active: boolean | null
          prize_money: number | null
          race_name: string
          start_time: string
          surface: string
          tier_restriction: string | null
          track_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          distance: string
          end_time?: string | null
          id?: number
          is_active?: boolean | null
          prize_money?: number | null
          race_name: string
          start_time: string
          surface: string
          tier_restriction?: string | null
          track_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          distance?: string
          end_time?: string | null
          id?: number
          is_active?: boolean | null
          prize_money?: number | null
          race_name?: string
          start_time?: string
          surface?: string
          tier_restriction?: string | null
          track_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      race_tier_notes: {
        Row: {
          created_at: string
          id: number
          note: string
          race_id: number
          tier: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          note?: string
          race_id: number
          tier: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          note?: string
          race_id?: number
          tier?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      distance_type:
        | "800"
        | "900"
        | "1000"
        | "1200"
        | "1400"
        | "1600"
        | "1800"
        | "2000"
        | "2200"
        | "2400"
        | "2600"
        | "2800"
        | "3000"
        | "3200"
        | "1100"
      position_type: "front" | "middle" | "back"
      surface_type:
        | "very_hard"
        | "hard"
        | "firm"
        | "medium"
        | "soft"
        | "very_soft"
      trait_category_type:
        | "multi_modes"
        | "flat_racing"
        | "steeplechase"
        | "cross_country"
        | "misc"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      distance_type: [
        "800",
        "900",
        "1000",
        "1200",
        "1400",
        "1600",
        "1800",
        "2000",
        "2200",
        "2400",
        "2600",
        "2800",
        "3000",
        "3200",
        "1100",
      ],
      position_type: ["front", "middle", "back"],
      surface_type: [
        "very_hard",
        "hard",
        "firm",
        "medium",
        "soft",
        "very_soft",
      ],
      trait_category_type: [
        "multi_modes",
        "flat_racing",
        "steeplechase",
        "cross_country",
        "misc",
      ],
    },
  },
} as const
