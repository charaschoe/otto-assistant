#!/usr/bin/env python3
import sys
import os
from faster_whisper import WhisperModel
import mimetypes

def is_valid_audio_file(file_path):
    """Überprüfe, ob die Datei eine gültige Audiodatei ist."""
    if not os.path.exists(file_path):
        return False
    
    # Überprüfe Dateigröße (max 100MB)
    if os.path.getsize(file_path) > 100 * 1024 * 1024:
        print(f"Warnung: Datei ist größer als 100MB: {file_path}")
        return False
    
    # Überprüfe Dateiendung (MIME-Type ist unreliable für WAV)
    valid_extensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.wma']
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension not in valid_extensions:
        print(f"Warnung: Unsupported audio format: {file_path} (Extension: {file_extension})")
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
            model = WhisperModel("base", device="cpu", compute_type="int8")
        except Exception as e:
            print(f"Fehler beim Laden des Whisper-Modells: {str(e)}")
            sys.exit(4)
        
        # Transkribiere die Audiodatei
        segments, info = model.transcribe(audio_file, beam_size=5)
        
        # Sammle alle Segmente zu einem vollständigen Text
        transcript_text = ""
        for segment in segments:
            transcript_text += segment.text
        
        # Ausgabe des Transkripts mit Markern für die Extraktion
        print("📝 TRANSKRIPT_START")
        print(transcript_text)
        print("📝 TRANSKRIPT_END")
        
        return transcript_text
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
