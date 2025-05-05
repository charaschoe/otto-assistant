#!/usr/bin/env python3

import os
import sys

def main():
    """
    Hauptfunktion zum Testen der Systemkonfiguration und verfügbaren Python-Version
    """
    print("Python-Version:", sys.version)
    print("Python-Pfad:", sys.executable)
    print("Arbeitsverzeichnis:", os.getcwd())
    
    # Verfügbare Module prüfen
    try:
        import whisper
        print("✅ whisper Modul ist verfügbar")
    except ImportError:
        print("❌ whisper Modul ist nicht installiert")
    
    try:
        import mimetypes
        print("✅ mimetypes Modul ist verfügbar")
    except ImportError:
        print("❌ mimetypes Modul ist nicht installiert")
    
    # Pfadstruktur prüfen
    scan_paths = [
        "src/transcription",
        "src/utils",
    ]
    
    print("\nPrüfe Pfadstruktur:")
    for path in scan_paths:
        if os.path.exists(path):
            print(f"✅ {path} existiert")
        else:
            print(f"❌ {path} existiert nicht")
    
    print("\nBefehle zum Ausführen:")
    print("- python3 src/transcription/whisper-transcribe.py [audiodatei]")
    print("- python3 src/utils/security_scan.py .")

if __name__ == "__main__":
    main()