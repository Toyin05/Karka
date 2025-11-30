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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          action_type: string | null
          alert_id: string
          attempts: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          message_template: string | null
          result: string | null
          status: Database["public"]["Enums"]["action_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_type?: string | null
          alert_id: string
          attempts?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          message_template?: string | null
          result?: string | null
          status?: Database["public"]["Enums"]["action_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_type?: string | null
          alert_id?: string
          attempts?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          message_template?: string | null
          result?: string | null
          status?: Database["public"]["Enums"]["action_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          caption: string | null
          confidence: number
          detected_at: string | null
          id: string
          label: Database["public"]["Enums"]["alert_label"]
          platform: Database["public"]["Enums"]["platform_type"]
          reviewed_at: string | null
          screenshot_url: string | null
          similarity_score: number | null
          source_account: string | null
          source_url: string
          status: Database["public"]["Enums"]["alert_status"] | null
          user_id: string
          video_frame_url: string | null
        }
        Insert: {
          caption?: string | null
          confidence: number
          detected_at?: string | null
          id?: string
          label: Database["public"]["Enums"]["alert_label"]
          platform: Database["public"]["Enums"]["platform_type"]
          reviewed_at?: string | null
          screenshot_url?: string | null
          similarity_score?: number | null
          source_account?: string | null
          source_url: string
          status?: Database["public"]["Enums"]["alert_status"] | null
          user_id: string
          video_frame_url?: string | null
        }
        Update: {
          caption?: string | null
          confidence?: number
          detected_at?: string | null
          id?: string
          label?: Database["public"]["Enums"]["alert_label"]
          platform?: Database["public"]["Enums"]["platform_type"]
          reviewed_at?: string | null
          screenshot_url?: string | null
          similarity_score?: number | null
          source_account?: string | null
          source_url?: string
          status?: Database["public"]["Enums"]["alert_status"] | null
          user_id?: string
          video_frame_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      identities: {
        Row: {
          camp_tx_hash: string | null
          embeddings: Json | null
          id: string
          identity_hash: string
          onboarding_completed: boolean | null
          photo_urls: string[] | null
          registered_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          camp_tx_hash?: string | null
          embeddings?: Json | null
          id?: string
          identity_hash: string
          onboarding_completed?: boolean | null
          photo_urls?: string[] | null
          registered_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          camp_tx_hash?: string | null
          embeddings?: Json | null
          id?: string
          identity_hash?: string
          onboarding_completed?: boolean | null
          photo_urls?: string[] | null
          registered_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string | null
          domain: string | null
          handle: string
          id: string
          notes: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          source_type: Database["public"]["Enums"]["source_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          handle: string
          id?: string
          notes?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          source_type: Database["public"]["Enums"]["source_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          handle?: string
          id?: string
          notes?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          source_type?: Database["public"]["Enums"]["source_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_status:
        | "pending"
        | "submitted"
        | "success"
        | "failed"
        | "removed"
        | "still_active"
      alert_label: "impersonation" | "repost" | "deepfake" | "name_mention"
      alert_status: "new" | "reviewing" | "actioned" | "ignored"
      app_role: "admin" | "user"
      platform_type: "tiktok" | "twitter" | "youtube"
      source_type: "whitelist" | "blocklist"
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
      action_status: [
        "pending",
        "submitted",
        "success",
        "failed",
        "removed",
        "still_active",
      ],
      alert_label: ["impersonation", "repost", "deepfake", "name_mention"],
      alert_status: ["new", "reviewing", "actioned", "ignored"],
      app_role: ["admin", "user"],
      platform_type: ["tiktok", "twitter", "youtube"],
      source_type: ["whitelist", "blocklist"],
    },
  },
} as const
