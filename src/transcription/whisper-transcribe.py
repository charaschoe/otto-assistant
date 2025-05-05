#!/usr/bin/env python3
import sys
import os
import whisper

def transcribe_audio(audio_file):
    try:
        # Überprüfe, ob die Audiodatei existiert
        if not os.path.exists(audio_file):
            print(f"Fehler: Audiodatei nicht gefunden: {audio_file}")
            return ""
            
        # Lade das Whisper-Modell (kleineres Modell für schnellere Verarbeitung)
        model = whisper.load_model("base")
        
        # Transkribiere die Audiodatei
        result = model.transcribe(audio_file)
        
        # Ausgabe des Transkripts mit Markern für die Extraktion
        print("📝 TRANSKRIPT_START")
        print(result["text"])
        print("📝 TRANSKRIPT_END")
        
        return result["text"]
    except Exception as e:
        print(f"Fehler bei der Transkription: {str(e)}")
        return ""

if __name__ == "__main__":
    # Überprüfe die Befehlszeilenargumente
    if len(sys.argv) < 2:
        print("Verwendung: python whisper-transcribe.py [audio_file_path]")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    transcribe_audio(audio_file)