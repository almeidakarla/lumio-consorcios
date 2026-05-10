export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          company: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          company?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          company?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          name: string;
          email: string | null;
          phone: string | null;
          type: string;
          interest: string | null;
          notes: string | null;
          rent_value: number | null;
          city: string | null;
          neighborhood: string | null;
          funnel_stage: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          type: string;
          interest?: string | null;
          notes?: string | null;
          rent_value?: number | null;
          city?: string | null;
          neighborhood?: string | null;
          funnel_stage: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          type?: string;
          interest?: string | null;
          notes?: string | null;
          rent_value?: number | null;
          city?: string | null;
          neighborhood?: string | null;
          funnel_stage?: string;
        };
      };
    };
  };
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type DbLead = Database["public"]["Tables"]["leads"]["Row"];
export type DbLeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type DbLeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
