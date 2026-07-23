import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigMessage = "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.";

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Product {
  id: string;
  name: string;
  desc?: string;
  image?: string;
  image_url?: string;
  points?: string[];
  co2_factor?: number;
  waste_factor?: number;
  impact?: {
    co2: string;
    trees: string;
  };
  full_details?: string;
  base_price?: number;
  price?: string;
  sizes?: string[];
}
