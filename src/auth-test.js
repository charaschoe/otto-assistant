import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Korrekte Initialisierung des Supabase-Clients
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseClient;
