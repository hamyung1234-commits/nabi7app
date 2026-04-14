/**
 * Database Type Definitions
 * Auto-generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          contact: string | null
          customer_type: 'seller' | 'buyer' | 'both' | null
          manager: string | null
          first_deal_date: string | null
          recent_deal_date: string | null
          interested_stocks: string | null
          bank_name: string | null
          account_number: string | null
          account_holder: string | null
          status: 'active' | 'inactive' | 'blacklist' | null
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact?: string | null
          customer_type?: 'seller' | 'buyer' | 'both' | null
          manager?: string | null
          first_deal_date?: string | null
          recent_deal_date?: string | null
          interested_stocks?: string | null
          bank_name?: string | null
          account_number?: string | null
          account_holder?: string | null
          status?: 'active' | 'inactive' | 'blacklist' | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string | null
          customer_type?: 'seller' | 'buyer' | 'both' | null
          manager?: string | null
          first_deal_date?: string | null
          recent_deal_date?: string | null
          interested_stocks?: string | null
          bank_name?: string | null
          account_number?: string | null
          account_holder?: string | null
          status?: 'active' | 'inactive' | 'blacklist' | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          stock_name: string
          industry: string | null
          current_price: number | null
          par_value: number | null
          total_shares: number | null
          total_capital: number | null
          total_debt: number | null
          revenue: number | null
          operating_profit: number | null
          net_profit: number | null
          industry_per: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stock_name: string
          industry?: string | null
          current_price?: number | null
          par_value?: number | null
          total_shares?: number | null
          total_capital?: number | null
          total_debt?: number | null
          revenue?: number | null
          operating_profit?: number | null
          net_profit?: number | null
          industry_per?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stock_name?: string
          industry?: string | null
          current_price?: number | null
          par_value?: number | null
          total_shares?: number | null
          total_capital?: number | null
          total_debt?: number | null
          revenue?: number | null
          operating_profit?: number | null
          net_profit?: number | null
          industry_per?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          date: string
          stock_name: string | null
          buyer: string | null
          buy_quantity: number | null
          buy_unit_price: number | null
          buy_total: number | null
          seller: string | null
          sell_quantity: number | null
          sell_unit_price: number | null
          sell_total: number | null
          transfer_profit: number | null
          actual_receipt: number | null
          customer_name: string | null
          manager: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          stock_name?: string | null
          buyer?: string | null
          buy_quantity?: number | null
          buy_unit_price?: number | null
          buy_total?: number | null
          seller?: string | null
          sell_quantity?: number | null
          sell_unit_price?: number | null
          sell_total?: number | null
          transfer_profit?: number | null
          actual_receipt?: number | null
          customer_name?: string | null
          manager?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          stock_name?: string | null
          buyer?: string | null
          buy_quantity?: number | null
          buy_unit_price?: number | null
          buy_total?: number | null
          seller?: string | null
          sell_quantity?: number | null
          sell_unit_price?: number | null
          sell_total?: number | null
          transfer_profit?: number | null
          actual_receipt?: number | null
          customer_name?: string | null
          manager?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      price_checks: {
        Row: {
          id: string
          date: string
          stock_name: string | null
          sell_price: number | null
          buy_price: number | null
          quantity: number | null
          holder_company: string | null
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          stock_name?: string | null
          sell_price?: number | null
          buy_price?: number | null
          quantity?: number | null
          holder_company?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          stock_name?: string | null
          sell_price?: number | null
          buy_price?: number | null
          quantity?: number | null
          holder_company?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_requests: {
        Row: {
          id: string
          client_name: string
          contact: string | null
          target_stock: string | null
          request_type: 'buy' | 'sell' | null
          quantity: number | null
          desired_price: number | null
          request_date: string | null
          status: 'pending' | 'in-progress' | 'completed' | 'on-hold' | null
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          contact?: string | null
          target_stock?: string | null
          request_type?: 'buy' | 'sell' | null
          quantity?: number | null
          desired_price?: number | null
          request_date?: string | null
          status?: 'pending' | 'in-progress' | 'completed' | 'on-hold' | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          contact?: string | null
          target_stock?: string | null
          request_type?: 'buy' | 'sell' | null
          quantity?: number | null
          desired_price?: number | null
          request_date?: string | null
          status?: 'pending' | 'in-progress' | 'completed' | 'on-hold' | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          bank_name: string
          account_number: string | null
          account_holder: string | null
          purpose: string | null
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_name: string
          account_number?: string | null
          account_holder?: string | null
          purpose?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_name?: string
          account_number?: string | null
          account_holder?: string | null
          purpose?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      diary_entries: {
        Row: {
          id: string
          date: string
          content: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          content?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          content?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      memos: {
        Row: {
          id: string
          title: string | null
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          related_stock: string | null
          client: string | null
          due_date: string | null
          status: 'waiting' | 'in-progress' | 'completed' | 'on-hold' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          related_stock?: string | null
          client?: string | null
          due_date?: string | null
          status?: 'waiting' | 'in-progress' | 'completed' | 'on-hold' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          related_stock?: string | null
          client?: string | null
          due_date?: string | null
          status?: 'waiting' | 'in-progress' | 'completed' | 'on-hold' | null
          created_at?: string
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
