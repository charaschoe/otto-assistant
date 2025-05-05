// Database-Service für Supabase
import supabase from '../config/supabase.js';

// Verschlüsselung für sensible Daten
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'defaultDevKey_ChangeThisInProduction!';

// Verschlüsselungsfunktionen
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = Buffer.from(textParts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Initialisierung der Tabellen
export async function initTables() {
  // Diese Funktion ist optional für Supabase, da Tabellen über die UI erstellt werden können
  // Die SQL-Definitionen sind hier nur als Referenz
  
  // credentials Tabelle
  // CREATE TABLE credentials (
  //   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  //   user_id UUID NOT NULL REFERENCES auth.users(id),
  //   service TEXT NOT NULL,
  //   data TEXT NOT NULL,
  //   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  //   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  // );
  // CREATE UNIQUE INDEX credentials_user_service_idx ON credentials (user_id, service);
  
  // transcripts Tabelle
  // CREATE TABLE transcripts (
  //   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  //   user_id UUID NOT NULL REFERENCES auth.users(id),
  //   title TEXT,
  //   content TEXT NOT NULL,
  //   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  // );
  
  console.log('Tabellen-Referenz bereitgestellt (manuelle Erstellung in Supabase UI erforderlich)');
}

// API-Credential-Verwaltung
export async function saveCredential(userId, service, data) {
  try {
    // Verschlüsselte Daten speichern
    const encryptedData = encrypt(data);
    
    // Prüfen, ob bereits ein Eintrag existiert
    const { data: existingData, error: fetchError } = await supabase
      .from('credentials')
      .select('id')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Fehler beim Prüfen bestehender Credentials:', fetchError);
      return false;
    }
    
    if (existingData) {
      // Update bestehender Eintrag
      const { error } = await supabase
        .from('credentials')
        .update({ 
          data: encryptedData,
          updated_at: new Date()
        })
        .eq('id', existingData.id);
      
      if (error) {
        console.error('Fehler beim Aktualisieren von Credentials:', error);
        return false;
      }
    } else {
      // Neuen Eintrag erstellen
      const { error } = await supabase
        .from('credentials')
        .insert({
          user_id: userId,
          service: service,
          data: encryptedData
        });
      
      if (error) {
        console.error('Fehler beim Erstellen von Credentials:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Allgemeiner Fehler bei saveCredential:', error);
    return false;
  }
}

export async function getCredential(userId, service) {
  try {
    const { data, error } = await supabase
      .from('credentials')
      .select('data')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();
    
    if (error) {
      console.error('Fehler beim Abrufen von Credentials:', error);
      return null;
    }
    
    if (data && data.data) {
      return decrypt(data.data);
    }
    
    return null;
  } catch (error) {
    console.error('Allgemeiner Fehler bei getCredential:', error);
    return null;
  }
}

// Transkript-Verwaltung
export async function saveTranscript(userId, content, title) {
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .insert({
        user_id: userId,
        content: content,
        title: title || `Transkript ${new Date().toLocaleString()}`
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Fehler beim Speichern des Transkripts:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Allgemeiner Fehler bei saveTranscript:', error);
    return null;
  }
}

export async function getTranscripts(userId) {
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Transkripte:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Allgemeiner Fehler bei getTranscripts:', error);
    return [];
  }
}

export async function getTranscript(id, userId) {
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Fehler beim Abrufen des Transkripts:', error);
      return null;
    }
    
    // Sicherheitscheck: Nur eigene Transkripte zurückgeben
    if (data && data.user_id === userId) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Allgemeiner Fehler bei getTranscript:', error);
    return null;
  }
}