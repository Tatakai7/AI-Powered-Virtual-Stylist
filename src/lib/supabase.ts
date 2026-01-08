import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.DEV ? 'http://localhost:3001' : import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  style_preferences: Record<string, unknown>;
  location: string;
  created_at: string;
  updated_at: string;
};

export type WardrobeItem = {
  id: string;
  user_id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'outerwear';
  color: string;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
  style_tags: string[];
  image_url: string;
  created_at: string;
};

export type Outfit = {
  id: string;
  user_id: string;
  name: string;
  occasion: string;
  season: string;
  items: string[];
  ai_score: number;
  is_favorite: boolean;
  created_at: string;
};

export type StyleRecommendation = {
  id: string;
  user_id: string;
  outfit_id: string;
  occasion: string;
  weather_conditions: Record<string, unknown>;
  recommendation_score: number;
  created_at: string;
};
