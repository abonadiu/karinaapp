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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          facilitator_id: string
          id: string
          name: string
          notes: string | null
          total_licenses: number
          updated_at: string
          used_licenses: number
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          facilitator_id: string
          id?: string
          name: string
          notes?: string | null
          total_licenses?: number
          updated_at?: string
          used_licenses?: number
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          facilitator_id?: string
          id?: string
          name?: string
          notes?: string | null
          total_licenses?: number
          updated_at?: string
          used_licenses?: number
        }
        Relationships: []
      }
      company_managers: {
        Row: {
          activated_at: string | null
          company_id: string
          created_at: string
          email: string
          id: string
          invite_token: string
          invited_by: string
          name: string
          status: string
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          company_id: string
          created_at?: string
          email: string
          id?: string
          invite_token?: string
          invited_by: string
          name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          invite_token?: string
          invited_by?: string
          name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_managers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_questions: {
        Row: {
          created_at: string
          dimension: string
          dimension_order: number
          id: string
          question_order: number
          question_text: string
          reverse_scored: boolean
        }
        Insert: {
          created_at?: string
          dimension: string
          dimension_order: number
          id?: string
          question_order: number
          question_text: string
          reverse_scored?: boolean
        }
        Update: {
          created_at?: string
          dimension?: string
          dimension_order?: number
          id?: string
          question_order?: number
          question_text?: string
          reverse_scored?: boolean
        }
        Relationships: []
      }
      diagnostic_responses: {
        Row: {
          answered_at: string
          created_at: string
          id: string
          inserted_by: string | null
          participant_id: string
          question_id: string
          score: number
        }
        Insert: {
          answered_at?: string
          created_at?: string
          id?: string
          inserted_by?: string | null
          participant_id: string
          question_id: string
          score: number
        }
        Update: {
          answered_at?: string
          created_at?: string
          id?: string
          inserted_by?: string | null
          participant_id?: string
          question_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_responses_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_results: {
        Row: {
          completed_at: string
          created_at: string
          dimension_scores: Json
          exercises_data: Json
          id: string
          inserted_by: string | null
          participant_id: string
          total_score: number
        }
        Insert: {
          completed_at?: string
          created_at?: string
          dimension_scores?: Json
          exercises_data?: Json
          id?: string
          inserted_by?: string | null
          participant_id: string
          total_score?: number
        }
        Update: {
          completed_at?: string
          created_at?: string
          dimension_scores?: Json
          exercises_data?: Json
          id?: string
          inserted_by?: string | null
          participant_id?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_results_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_reminders: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          participant_id: string
          reminder_number: number
          sent_at: string
          success: boolean
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          participant_id: string
          reminder_number: number
          sent_at?: string
          success?: boolean
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          participant_id?: string
          reminder_number?: number
          sent_at?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "participant_reminders_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          access_token: string
          company_id: string
          completed_at: string | null
          created_at: string
          department: string | null
          email: string
          facilitator_id: string
          id: string
          invited_at: string | null
          last_reminder_at: string | null
          name: string
          phone: string | null
          position: string | null
          reminder_count: number
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_token?: string
          company_id: string
          completed_at?: string | null
          created_at?: string
          department?: string | null
          email: string
          facilitator_id: string
          id?: string
          invited_at?: string | null
          last_reminder_at?: string | null
          name: string
          phone?: string | null
          position?: string | null
          reminder_count?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          company_id?: string
          completed_at?: string | null
          created_at?: string
          department?: string | null
          email?: string
          facilitator_id?: string
          id?: string
          invited_at?: string | null
          last_reminder_at?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          reminder_count?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          full_name: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_manager_invite: {
        Args: { p_token: string; p_user_id: string }
        Returns: boolean
      }
      get_company_activity_timeline: {
        Args: { p_company_id: string; p_limit?: number }
        Returns: Json
      }
      get_company_aggregate_stats: {
        Args: { p_company_id: string }
        Returns: Json
      }
      get_company_dimension_averages: {
        Args: { p_company_id: string }
        Returns: Json
      }
      get_manager_company_id: { Args: { _user_id: string }; Returns: string }
      get_manager_invite_by_token: {
        Args: { p_token: string }
        Returns: {
          company_id: string
          company_name: string
          email: string
          id: string
          name: string
        }[]
      }
      get_participant_by_token: { Args: { p_token: string }; Returns: string }
      get_pending_reminders: {
        Args: {
          p_batch_limit?: number
          p_days_after_invite?: number
          p_days_between_reminders?: number
          p_max_reminders?: number
        }
        Returns: {
          access_token: string
          days_since_invite: number
          facilitator_id: string
          invited_at: string
          participant_email: string
          participant_id: string
          participant_name: string
          reminder_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_facilitator_of_participant: {
        Args: { p_participant_id: string }
        Returns: boolean
      }
      record_reminder_sent: {
        Args: {
          p_error_message?: string
          p_participant_id: string
          p_success?: boolean
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "facilitator" | "company_manager"
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
      app_role: ["facilitator", "company_manager"],
    },
  },
} as const
