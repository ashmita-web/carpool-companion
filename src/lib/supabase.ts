import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rides: {
        Row: {
          id: string
          user_id: string
          type: 'offer' | 'request'
          pickup_location: string
          pickup_lat: number
          pickup_lng: number
          dropoff_location: string
          dropoff_lat: number
          dropoff_lng: number
          departure_time: string
          available_seats: number | null
          price: number | null
          preferences: string | null
          status: 'active' | 'matched' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'offer' | 'request'
          pickup_location: string
          pickup_lat: number
          pickup_lng: number
          dropoff_location: string
          dropoff_lat: number
          dropoff_lng: number
          departure_time: string
          available_seats?: number | null
          price?: number | null
          preferences?: string | null
          status?: 'active' | 'matched' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'offer' | 'request'
          pickup_location?: string
          pickup_lat?: number
          pickup_lng?: number
          dropoff_location?: string
          dropoff_lat?: number
          dropoff_lng?: number
          departure_time?: string
          available_seats?: number | null
          price?: number | null
          preferences?: string | null
          status?: 'active' | 'matched' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          rider_id: string
          driver_id: string
          ride_id: string
          match_score: number
          status: 'pending' | 'accepted' | 'declined' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rider_id: string
          driver_id: string
          ride_id: string
          match_score: number
          status?: 'pending' | 'accepted' | 'declined' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rider_id?: string
          driver_id?: string
          ride_id?: string
          match_score?: number
          status?: 'pending' | 'accepted' | 'declined' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}