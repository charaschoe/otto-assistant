// server.js - Hauptdatei für den Express-Server mit Supabase-Integration
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api-routes.js';
import authRoutes from './routes/auth-routes.js';
import dotenv from 'dotenv';

// Lade .env-Datei
dotenv.config();

// __dirname Ersatz für ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware für JSON und Form-Daten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Dateien aus dem public-Verzeichnis bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

// Uploads-Verzeichnis für temporäre Dateien erstellen
const uploadsDir = path.join(__dirname, 'uploads');
const exportsDir = path.join(__dirname, 'exports');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// API-Routen
app.use('/api', apiRoutes);
app.use('/api', authRoutes);

// Fallback-Route - Für alle anderen Anfragen das Frontend liefern
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
  
  // Umgebungsvariablen-Check
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'ENCRYPTION_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`⚠️ Fehlende Umgebungsvariablen: ${missingEnvVars.join(', ')}`);
    console.warn('Einige Funktionen könnten nicht richtig funktionieren.');
  }
});