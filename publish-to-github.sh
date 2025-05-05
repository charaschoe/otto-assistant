#!/bin/bash

# Navigiere zum Projektverzeichnis
cd /Users/admin/Downloads/otto-assistant-4231a7378de3353864a844bfbab73d7cc72da06b

# Stelle sicher, dass Git-Repository initialisiert ist
if [ ! -d ".git" ]; then
  echo "🔄 Git-Repository wird initialisiert..."
  git init
fi

# Prüfe, ob das Remote-Repository bereits eingerichtet ist
if ! git remote | grep -q "origin"; then
  echo "🔄 Remote-Repository wird hinzugefügt..."
  git remote add origin https://github.com/charaschoe/otto-assistant.git
else
  echo "✅ Remote-Repository 'origin' bereits konfiguriert"
fi

# Erstelle und wechsle zum Branch 'working_minimal'
echo "🔄 Wechsle zu Branch 'working_minimal'..."
git checkout -b working_minimal

# Füge alle Dateien hinzu
echo "🔄 Füge Dateien hinzu..."
git add .

# Erstelle Commit
echo "🔄 Erstelle Commit..."
git commit -m "Working minimal version with Obsidian Knowledge Graph integration"

# Pushe den Branch zu GitHub
echo "🔄 Pushe Branch 'working_minimal' zu GitHub..."
git push -u origin working_minimal

echo "✅ Fertig! Der Branch 'working_minimal' wurde zu GitHub gepusht."
echo "   Überprüfe: https://github.com/charaschoe/otto-assistant/branches"