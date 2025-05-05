// Supabase Konfiguration
import { createClient } from "@supabase/supabase-js";

// Supabase URL und API-Schlüssel sollten als Umgebungsvariablen gesetzt werden
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Erstellen des Supabase Clients
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
