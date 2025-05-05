import os
import tempfile
import whisper

def transcribe_audio(audio_file_path):
    """
    Transkribiert eine Audiodatei mit Whisper lokal statt in der Cloud.
    
    Args:
        audio_file_path: Pfad zur Audiodatei
        
    Returns:
        Der transkribierte Text
    """
    # Lade das Whisper-Modell (standardmäßig "base", andere Optionen: "tiny", "small", "medium", "large")
    model = whisper.load_model("base")
    
    # Transkribiere die Audiodatei
    result = model.transcribe(audio_file_path)
    
    # Gib den transkribierten Text zurück
    return result["text"]