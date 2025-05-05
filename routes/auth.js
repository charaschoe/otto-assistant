// API-Routes für Authentifizierung und User-Management
const express = require('express');
const router = express.Router();
const { createUserToken, authenticate } = require('../src/auth/auth');
const { getOrCreateUser, saveCredential, getCredential } = require('../src/database/db');

// Benutzer registrieren oder anmelden
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email und Passwort sind erforderlich' });
    }
    
    // Token generieren (vereinfachte Implementation)
    const { token, userId } = await createUserToken(email, password);
    
    // Benutzer in der Datenbank anlegen, falls noch nicht vorhanden
    await getOrCreateUser(userId);
    
    res.json({ token, userId });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server-Fehler bei der Anmeldung' });
  }
});

// Sicheres Speichern von Credentials
router.post('/credentials', authenticate, async (req, res) => {
  try {
    const { service, data } = req.body;
    const userId = req.user.id;
    
    if (!service || !data) {
      return res.status(400).json({ error: 'Service und Daten sind erforderlich' });
    }
    
    const success = await saveCredential(userId, service, JSON.stringify(data));
    
    if (success) {
      res.json({ success: true, message: `${service}-Credentials erfolgreich gespeichert` });
    } else {
      res.status(500).json({ error: 'Fehler beim Speichern der Credentials' });
    }
  } catch (error) {
    console.error('Save Credentials Error:', error);
    res.status(500).json({ error: 'Server-Fehler beim Speichern der Credentials' });
  }
});

// Abrufen von Credentials
router.get('/credentials/:service', authenticate, async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;
    
    const credential = await getCredential(userId, service);
    
    if (credential) {
      res.json({ data: JSON.parse(credential) });
    } else {
      res.status(404).json({ error: `Keine ${service}-Credentials gefunden` });
    }
  } catch (error) {
    console.error('Get Credentials Error:', error);
    res.status(500).json({ error: 'Server-Fehler beim Abrufen der Credentials' });
  }
});

module.exports = router;