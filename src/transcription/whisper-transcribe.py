#!/usr/bin/env python3
import sys
import os
import whisper
import mimetypes

def is_valid_audio_file(file_path):
    """Überprüfe, ob die Datei eine gültige Audiodatei ist."""
    if not os.path.exists(file_path):
        return False
    
    # Überprüfe Dateigröße (max 100MB)
    if os.path.getsize(file_path) > 100 * 1024 * 1024:
        print(f"Warnung: Datei ist größer als 100MB: {file_path}")
        return False
    
    # Überprüfe MIME-Typ
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None or not mime_type.startswith('audio/'):
        print(f"Warnung: Datei scheint keine Audiodatei zu sein: {file_path}")
        return False
    
    return True

def transcribe_audio(audio_file):
    try:
        # Überprüfe, ob die Audiodatei existiert und gültig ist
        if not os.path.exists(audio_file):
            print(f"Fehler: Audiodatei nicht gefunden: {audio_file}")
            sys.exit(2)

        if not is_valid_audio_file(audio_file):
            print(f"Fehler: Ungültige Audiodatei: {audio_file}")
            sys.exit(3)
            
        # Lade das Whisper-Modell (kleineres Modell für schnellere Verarbeitung)
        try:
            model = whisper.load_model("base")
        except Exception as e:
            print(f"Fehler beim Laden des Whisper-Modells: {str(e)}")
            sys.exit(4)
        
        # Transkribiere die Audiodatei
        result = model.transcribe(audio_file, verbose=True, logprob_threshold=-1.0)
        
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
