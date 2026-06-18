export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: 'flipper' | 'supplier' | 'admin'
          company_name: string | null
          phone: string | null
          location: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role?: 'flipper' | 'supplier' | 'admin'
          company_name?: string | null
          phone?: string | null
          location?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          email?: string | null
          role?: 'flipper' | 'supplier' | 'admin'
          company_name?: string | null
          phone?: string | null
          location?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          location: string | null
          price_range: string | null
          rating: number
          review_count: number
          verified: boolean
          contact_email: string | null
          contact_phone: string | null
          website: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          name: string
          category: string
          description?: string | null
          location?: string | null
          price_range?: string | null
          rating?: number
          review_count?: number
          verified?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          created_by?: string | null
        }
        Update: {
          name?: string
          category?: string
          description?: string | null
          location?: string | null
          price_range?: string | null
          rating?: number
          review_count?: number
          verified?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          property_address: string | null
          status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          budget: number
          spent: number
          start_date: string | null
          target_end_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          property_address?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          budget?: number
          spent?: number
          start_date?: string | null
          target_end_date?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          property_address?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
          budget?: number
          spent?: number
          start_date?: string | null
          target_end_date?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          project_id: string
          user_id: string
          date: string
          description: string
          category: string
          amount: number
          type: 'income' | 'expense'
          receipt_url: string | null
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          date?: string
          description: string
          category?: string
          amount: number
          type: 'income' | 'expense'
          receipt_url?: string | null
        }
        Update: {
          date?: string
          description?: string
          category?: string
          amount?: number
          type?: 'income' | 'expense'
          receipt_url?: string | null
        }
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          supplier_id: string
          notes: string | null
          added_at: string
        }
        Insert: {
          user_id: string
          supplier_id: string
          notes?: string | null
        }
        Update: {
          notes?: string | null
        }
      }
      saved_properties: {
        Row: {
          id: string
          user_id: string
          address: string
          price: number | null
          bedrooms: number | null
          bathrooms: number | null
          description: string | null
          source_url: string | null
          status: 'watching' | 'under_offer' | 'purchased' | 'passed'
          saved_at: string
        }
        Insert: {
          user_id: string
          address: string
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          description?: string | null
          source_url?: string | null
          status?: 'watching' | 'under_offer' | 'purchased' | 'passed'
        }
        Update: {
          address?: string
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          description?: string | null
          source_url?: string | null
          status?: 'watching' | 'under_offer' | 'purchased' | 'passed'
        }
      }
      todos: {
        Row: {
          id: string
          project_id: string
          user_id: string
          text: string
          completed: boolean
          due_date: string | null
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          text: string
          completed?: boolean
          due_date?: string | null
        }
        Update: {
          text?: string
          completed?: boolean
          due_date?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'inactive' | 'past_due' | 'canceled'
          plan: 'monthly' | 'annual'
          current_period_start: string | null
          current_period_end: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          status?: 'active' | 'inactive' | 'past_due' | 'canceled'
          plan?: 'monthly' | 'annual'
          current_period_start?: string | null
          current_period_end?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          status?: 'active' | 'inactive' | 'past_due' | 'canceled'
          plan?: 'monthly' | 'annual'
          current_period_start?: string | null
          current_period_end?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
      }
      ad_purchases: {
        Row: {
          id: string
          supplier_id: string
          type: 'yearly_unlimited' | 'per_lead'
          amount: number
          status: 'active' | 'expired' | 'pending'
          starts_at: string
          ends_at: string | null
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          supplier_id: string
          type: 'yearly_unlimited' | 'per_lead'
          amount: number
          status?: 'active' | 'expired' | 'pending'
          starts_at?: string
          ends_at?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          status?: 'active' | 'expired' | 'pending'
          ends_at?: string | null
          stripe_payment_intent_id?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          supplier_id: string
          flipper_user_id: string | null
          flipper_name: string
          project: string | null
          message: string
          status: 'new' | 'contacted' | 'quoted' | 'closed'
          reply_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          supplier_id: string
          flipper_user_id?: string | null
          flipper_name: string
          project?: string | null
          message: string
          status?: 'new' | 'contacted' | 'quoted' | 'closed'
          reply_message?: string | null
        }
        Update: {
          flipper_user_id?: string | null
          flipper_name?: string
          project?: string | null
          message?: string
          status?: 'new' | 'contacted' | 'quoted' | 'closed'
          reply_message?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
