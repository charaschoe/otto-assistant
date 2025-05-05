-- Tabellenerstellung für otto-assistant in Supabase
-- Dieses Skript im SQL-Editor von Supabase ausführen

-- Credentials-Tabelle für API-Schlüssel 
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eindeutiger Index, um doppelte Einträge zu vermeiden
CREATE UNIQUE INDEX credentials_user_service_idx ON public.credentials (user_id, service);

-- Row Level Security für die credentials-Tabelle
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Richtlinien: Benutzer können nur ihre eigenen Credentials sehen und bearbeiten
CREATE POLICY "Benutzer können nur ihre eigenen Credentials sehen" 
  ON public.credentials FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Benutzer können nur ihre eigenen Credentials erstellen" 
  ON public.credentials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Benutzer können nur ihre eigenen Credentials aktualisieren" 
  ON public.credentials FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Benutzer können nur ihre eigenen Credentials löschen" 
  ON public.credentials FOR DELETE 
  USING (auth.uid() = user_id);

-- Transkript-Tabelle für gespeicherte Transkriptionen
CREATE TABLE public.transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security für die transcripts-Tabelle
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Richtlinien: Benutzer können nur ihre eigenen Transkriptionen sehen und bearbeiten
CREATE POLICY "Benutzer können nur ihre eigenen Transkriptionen sehen" 
  ON public.transcripts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Benutzer können nur ihre eigenen Transkriptionen erstellen" 
  ON public.transcripts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Benutzer können nur ihre eigenen Transkriptionen aktualisieren" 
  ON public.transcripts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Benutzer können nur ihre eigenen Transkriptionen löschen" 
  ON public.transcripts FOR DELETE 
  USING (auth.uid() = user_id);