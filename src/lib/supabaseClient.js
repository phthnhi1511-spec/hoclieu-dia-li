import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Thieu cau hinh Supabase trong bien moi truong Vite.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
