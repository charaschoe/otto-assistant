// Auth-Routen für Supabase-Integration
import express from 'express';
import { signUp, signIn, resetPassword } from '../src/auth/auth-service.js';
import { authMiddleware } from '../src/auth/auth-service.js';
import { saveCredential, getCredential } from '../src/database/db-service.js';

const router = express.Router();

// Benutzer registrieren
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email und Passwort sind erforderlich' });
    }
    
    const data = await signUp(email, password);
    
    res.json({ 
      message: 'Benutzer erfolgreich registriert. Bitte überprüfen Sie Ihre E-Mail für die Bestätigung.',
      user: data.user
    });
  } catch (error) {
    console.error('Registrierungs-Fehler:', error);
    res.status(500).json({ 
      error: error.message || 'Fehler bei der Registrierung' 
    });
  }
});

// Benutzer anmelden
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email und Passwort sind erforderlich' });
    }
    
    const data = await signIn(email, password);
    
    res.json({
      token: data.session.access_token,
      user: data.user
    });
  } catch (error) {
    console.error('Login-Fehler:', error);
    res.status(401).json({ 
      error: error.message || 'Ungültige Anmeldedaten' 
    });
  }
});

// Passwort zurücksetzen
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email ist erforderlich' });
    }
    
    await resetPassword(email);
    
    res.json({ 
      message: 'Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.' 
    });
  } catch (error) {
    console.error('Passwort-Reset-Fehler:', error);
    // Wir geben eine generische Erfolgsantwort zurück, um keine Informationen über vorhandene Konten preiszugeben
    res.json({ 
      message: 'Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.' 
    });
  }
});

// Sicheres Speichern von API-Schlüsseln und Credentials
router.post('/credentials', authMiddleware, async (req, res) => {
  try {
    const { service, data } = req.body;
    const userId = req.user.id;
    
    if (!service || !data) {
      return res.status(400).json({ error: 'Service und Daten sind erforderlich' });
    }
    
    const success = await saveCredential(userId, service, JSON.stringify(data));
    
    if (success) {
      res.json({ 
        success: true, 
        message: `${service}-Anmeldedaten erfolgreich gespeichert` 
      });
    } else {
      res.status(500).json({ 
        error: 'Fehler beim Speichern der Anmeldedaten' 
      });
    }
  } catch (error) {
    console.error('Credential-Speicher-Fehler:', error);
    res.status(500).json({ 
      error: error.message || 'Fehler beim Speichern der Anmeldedaten' 
    });
  }
});

// Abrufen von API-Schlüsseln und Credentials
router.get('/credentials/:service', authMiddleware, async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;
    
    const credential = await getCredential(userId, service);
    
    if (credential) {
      res.json({ 
        data: JSON.parse(credential) 
      });
    } else {
      res.status(404).json({ 
        error: `Keine ${service}-Anmeldedaten gefunden` 
      });
    }
  } catch (error) {
    console.error('Credential-Abruf-Fehler:', error);
    res.status(500).json({ 
      error: error.message || 'Fehler beim Abrufen der Anmeldedaten' 
    });
  }
});

export default router;