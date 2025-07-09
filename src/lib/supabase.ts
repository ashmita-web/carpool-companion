import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  is_premium: boolean;
  is_verified: boolean;
  eco_coins: number;
  total_rides: number;
  co2_saved: number;
  created_at: string;
  preferences?: {
    music?: string;
    pets?: boolean;
    smoking?: boolean;
    personality?: string;
  };
}

export interface Ride {
  id: string;
  driver_id: string;
  from_location: string;
  to_location: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  is_event_ride: boolean;
  event_id?: string;
  created_at: string;
  driver?: Profile;
}

export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats_booked: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  ride?: Ride;
  passenger?: Profile;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  demand_multiplier: number;
  is_active: boolean;
  created_at: string;
}