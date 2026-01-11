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
      categories: {
        Row: {
          analytics_code: string | null
          banner_override: string | null
          created_at: string
          description: string | null
          footer_copyright_text: string | null
          footer_designer_name: string | null
          footer_designer_url: string | null
          footer_site_name: string | null
          h1_title: string | null
          hero_badge_text: string | null
          hero_cta_text: string | null
          hero_headline: string | null
          hero_pretitle: string | null
          icon: string | null
          id: string
          is_active: boolean
          long_content_bottom: string | null
          long_content_top: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          popup_headline: string | null
          popup_link: string | null
          popup_text: string | null
          site_name: string | null
          slug: string
          sort_order: number
          sticky_cta_link: string | null
          sticky_cta_text: string | null
          template: string
          theme: Database["public"]["Enums"]["category_theme"]
          updated_at: string
        }
        Insert: {
          analytics_code?: string | null
          banner_override?: string | null
          created_at?: string
          description?: string | null
          footer_copyright_text?: string | null
          footer_designer_name?: string | null
          footer_designer_url?: string | null
          footer_site_name?: string | null
          h1_title?: string | null
          hero_badge_text?: string | null
          hero_cta_text?: string | null
          hero_headline?: string | null
          hero_pretitle?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          long_content_bottom?: string | null
          long_content_top?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          popup_headline?: string | null
          popup_link?: string | null
          popup_text?: string | null
          site_name?: string | null
          slug: string
          sort_order?: number
          sticky_cta_link?: string | null
          sticky_cta_text?: string | null
          template?: string
          theme?: Database["public"]["Enums"]["category_theme"]
          updated_at?: string
        }
        Update: {
          analytics_code?: string | null
          banner_override?: string | null
          created_at?: string
          description?: string | null
          footer_copyright_text?: string | null
          footer_designer_name?: string | null
          footer_designer_url?: string | null
          footer_site_name?: string | null
          h1_title?: string | null
          hero_badge_text?: string | null
          hero_cta_text?: string | null
          hero_headline?: string | null
          hero_pretitle?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          long_content_bottom?: string | null
          long_content_top?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          popup_headline?: string | null
          popup_link?: string | null
          popup_text?: string | null
          site_name?: string | null
          slug?: string
          sort_order?: number
          sticky_cta_link?: string | null
          sticky_cta_text?: string | null
          template?: string
          theme?: Database["public"]["Enums"]["category_theme"]
          updated_at?: string
        }
        Relationships: []
      }
      category_projects: {
        Row: {
          category_id: string
          created_at: string
          id: string
          project_id: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          project_id: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_links: {
        Row: {
          column_name: string | null
          created_at: string
          id: string
          is_active: boolean
          label: string
          sort_order: number
          url: string
        }
        Insert: {
          column_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          url: string
        }
        Update: {
          column_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      popular_footer_links: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          label: string
          sort_order: number
          url: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          url: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "popular_footer_links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          affiliate_link: string | null
          badge_text: string | null
          category_id: string | null
          cons_list: string[] | null
          country_scope: Database["public"]["Enums"]["country_scope"]
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          is_default: boolean | null
          logo_url: string | null
          name: string
          pros_list: string[] | null
          rating: number | null
          short_description: string | null
          slug: string
          sort_order: number
          tags: string[] | null
          updated_at: string
          url: string
        }
        Insert: {
          affiliate_link?: string | null
          badge_text?: string | null
          category_id?: string | null
          cons_list?: string[] | null
          country_scope?: Database["public"]["Enums"]["country_scope"]
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          pros_list?: string[] | null
          rating?: number | null
          short_description?: string | null
          slug: string
          sort_order?: number
          tags?: string[] | null
          updated_at?: string
          url: string
        }
        Update: {
          affiliate_link?: string | null
          badge_text?: string | null
          category_id?: string | null
          cons_list?: string[] | null
          country_scope?: Database["public"]["Enums"]["country_scope"]
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          pros_list?: string[] | null
          rating?: number | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          tags?: string[] | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          click_count: number
          created_at: string
          id: string
          is_active: boolean
          slug: string
          target_url: string
          updated_at: string
        }
        Insert: {
          click_count?: number
          created_at?: string
          id?: string
          is_active?: boolean
          slug: string
          target_url: string
          updated_at?: string
        }
        Update: {
          click_count?: number
          created_at?: string
          id?: string
          is_active?: boolean
          slug?: string
          target_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          source_page: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          source_page?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          source_page?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          category_id: string | null
          city_reference: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          rating: number | null
          sort_order: number | null
          text: string
        }
        Insert: {
          category_id?: string | null
          city_reference?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rating?: number | null
          sort_order?: number | null
          text: string
        }
        Update: {
          category_id?: string | null
          city_reference?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rating?: number | null
          sort_order?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_redirect_click: {
        Args: { redirect_slug: string }
        Returns: string
      }
      verify_admin_access: { Args: never; Returns: boolean }
    }
    Enums: {
      category_theme: "DATING" | "ADULT" | "CASINO" | "GENERIC"
      country_scope: "AT" | "DE" | "DACH" | "EU"
      user_role: "ADMIN" | "USER"
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
      category_theme: ["DATING", "ADULT", "CASINO", "GENERIC"],
      country_scope: ["AT", "DE", "DACH", "EU"],
      user_role: ["ADMIN", "USER"],
    },
  },
} as const
