import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

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
