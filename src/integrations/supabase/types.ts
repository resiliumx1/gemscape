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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          add_ons: string[] | null
          adults: number | null
          booking_ref: string | null
          children: number | null
          country: string | null
          created_at: string | null
          email: string
          flight_details: string | null
          full_name: string
          id: string
          notes: string | null
          party_size: number
          phone: string
          pickup_location: string | null
          review_response: string | null
          review_sent_at: string | null
          reviewed: boolean | null
          service_type: string
          special_requests: string | null
          status: string | null
          total_estimate: number | null
          tour_date: string
        }
        Insert: {
          add_ons?: string[] | null
          adults?: number | null
          booking_ref?: string | null
          children?: number | null
          country?: string | null
          created_at?: string | null
          email: string
          flight_details?: string | null
          full_name: string
          id?: string
          notes?: string | null
          party_size: number
          phone: string
          pickup_location?: string | null
          review_response?: string | null
          review_sent_at?: string | null
          reviewed?: boolean | null
          service_type: string
          special_requests?: string | null
          status?: string | null
          total_estimate?: number | null
          tour_date: string
        }
        Update: {
          add_ons?: string[] | null
          adults?: number | null
          booking_ref?: string | null
          children?: number | null
          country?: string | null
          created_at?: string | null
          email?: string
          flight_details?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          party_size?: number
          phone?: string
          pickup_location?: string | null
          review_response?: string | null
          review_sent_at?: string | null
          reviewed?: boolean | null
          service_type?: string
          special_requests?: string | null
          status?: string | null
          total_estimate?: number | null
          tour_date?: string
        }
        Relationships: []
      }
      concierge_enquiries: {
        Row: {
          arrival_date: string | null
          created_at: string | null
          departure_date: string | null
          email: string
          flight_number: string | null
          guests: number | null
          id: string
          name: string
          requirements: string | null
          status: string | null
          whatsapp: string | null
        }
        Insert: {
          arrival_date?: string | null
          created_at?: string | null
          departure_date?: string | null
          email: string
          flight_number?: string | null
          guests?: number | null
          id?: string
          name: string
          requirements?: string | null
          status?: string | null
          whatsapp?: string | null
        }
        Update: {
          arrival_date?: string | null
          created_at?: string | null
          departure_date?: string | null
          email?: string
          flight_number?: string | null
          guests?: number | null
          id?: string
          name?: string
          requirements?: string | null
          status?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      contact_enquiries: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          service_interest: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          service_interest?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          service_interest?: string | null
        }
        Relationships: []
      }
      customer_notes: {
        Row: {
          created_at: string
          email: string
          id: string
          note: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          note: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          note?: string
        }
        Relationships: []
      }
      customer_tags: {
        Row: {
          created_at: string
          email: string
          id: string
          tag: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          tag: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          tag?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          booking_ref: string | null
          created_at: string
          email_type: string
          id: string
          recipient_email: string
          recipient_name: string | null
          resend_id: string | null
          status: string
          subject: string | null
        }
        Insert: {
          booking_ref?: string | null
          created_at?: string
          email_type: string
          id?: string
          recipient_email: string
          recipient_name?: string | null
          resend_id?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          booking_ref?: string | null
          created_at?: string
          email_type?: string
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          resend_id?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      package_bookings: {
        Row: {
          booking_ref: string | null
          created_at: string | null
          email: string
          experience_interests: string[] | null
          full_name: string
          id: string
          package_type: string
          party_size: number | null
          phone: string | null
          special_requests: string | null
          status: string | null
          total_price: number | null
          travel_dates: string | null
          updated_at: string | null
        }
        Insert: {
          booking_ref?: string | null
          created_at?: string | null
          email: string
          experience_interests?: string[] | null
          full_name: string
          id?: string
          package_type: string
          party_size?: number | null
          phone?: string | null
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          travel_dates?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_ref?: string | null
          created_at?: string | null
          email?: string
          experience_interests?: string[] | null
          full_name?: string
          id?: string
          package_type?: string
          party_size?: number | null
          phone?: string | null
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          travel_dates?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rental_bookings: {
        Row: {
          add_ons: string[] | null
          booking_ref: string | null
          country: string | null
          created_at: string | null
          daily_rate: number | null
          driver_license: string | null
          dropoff_location: string | null
          email: string
          full_name: string
          id: string
          license_country: string | null
          notes: string | null
          phone: string
          pickup_date: string
          pickup_location: string
          return_date: string
          review_sent_at: string | null
          reviewed: boolean | null
          special_requests: string | null
          status: string | null
          total_days: number | null
          total_estimate: number | null
          vehicle_id: string | null
        }
        Insert: {
          add_ons?: string[] | null
          booking_ref?: string | null
          country?: string | null
          created_at?: string | null
          daily_rate?: number | null
          driver_license?: string | null
          dropoff_location?: string | null
          email: string
          full_name: string
          id?: string
          license_country?: string | null
          notes?: string | null
          phone: string
          pickup_date: string
          pickup_location: string
          return_date: string
          review_sent_at?: string | null
          reviewed?: boolean | null
          special_requests?: string | null
          status?: string | null
          total_days?: number | null
          total_estimate?: number | null
          vehicle_id?: string | null
        }
        Update: {
          add_ons?: string[] | null
          booking_ref?: string | null
          country?: string | null
          created_at?: string | null
          daily_rate?: number | null
          driver_license?: string | null
          dropoff_location?: string | null
          email?: string
          full_name?: string
          id?: string
          license_country?: string | null
          notes?: string | null
          phone?: string
          pickup_date?: string
          pickup_location?: string
          return_date?: string
          review_sent_at?: string | null
          reviewed?: boolean | null
          special_requests?: string | null
          status?: string | null
          total_days?: number | null
          total_estimate?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_queue: {
        Row: {
          booking_id: string | null
          booking_type: string | null
          clicked: boolean | null
          created_at: string | null
          customer_email: string
          customer_name: string
          id: string
          opened: boolean | null
          review_left: boolean | null
          scheduled_send: string | null
          sent_at: string | null
          service_type: string | null
          tour_date: string | null
        }
        Insert: {
          booking_id?: string | null
          booking_type?: string | null
          clicked?: boolean | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          id?: string
          opened?: boolean | null
          review_left?: boolean | null
          scheduled_send?: string | null
          sent_at?: string | null
          service_type?: string | null
          tour_date?: string | null
        }
        Update: {
          booking_id?: string | null
          booking_type?: string | null
          clicked?: boolean | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          opened?: boolean | null
          review_left?: boolean | null
          scheduled_send?: string | null
          sent_at?: string | null
          service_type?: string | null
          tour_date?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          business_name: string | null
          created_at: string | null
          id: string
          owner_email: string | null
          review_delay_hours: number | null
          review_platforms: Json | null
          review_reminder_enabled: boolean | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          id?: string
          owner_email?: string | null
          review_delay_hours?: number | null
          review_platforms?: Json | null
          review_reminder_enabled?: boolean | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          id?: string
          owner_email?: string | null
          review_delay_hours?: number | null
          review_platforms?: Json | null
          review_reminder_enabled?: boolean | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_maintenance: {
        Row: {
          cost: number | null
          created_at: string
          id: string
          maintenance_date: string
          notes: string | null
          type: string
          vehicle_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          id?: string
          maintenance_date?: string
          notes?: string | null
          type?: string
          vehicle_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          id?: string
          maintenance_date?: string
          notes?: string | null
          type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          ac: boolean | null
          available: boolean | null
          category: string
          created_at: string | null
          daily_rate: number
          description: string | null
          features: string[] | null
          fuel_type: string
          id: string
          image_url: string | null
          image_url_2: string | null
          image_url_3: string | null
          luggage_capacity: number | null
          name: string
          seats: number
          sort_order: number | null
          transmission: string
          weekly_rate: number | null
        }
        Insert: {
          ac?: boolean | null
          available?: boolean | null
          category: string
          created_at?: string | null
          daily_rate: number
          description?: string | null
          features?: string[] | null
          fuel_type: string
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          luggage_capacity?: number | null
          name: string
          seats: number
          sort_order?: number | null
          transmission: string
          weekly_rate?: number | null
        }
        Update: {
          ac?: boolean | null
          available?: boolean | null
          category?: string
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          features?: string[] | null
          fuel_type?: string
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          luggage_capacity?: number | null
          name?: string
          seats?: number
          sort_order?: number | null
          transmission?: string
          weekly_rate?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_ref: { Args: { prefix: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
