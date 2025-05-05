# whisper-transcribe.py
import whisper
import sys

audio_path = sys.argv[1] if len(sys.argv) > 1 else "audio/test.wav"
model = whisper.load_model("base")

print("🧠 Transkribiere:", audio_path)
result = model.transcribe(audio_path, language="de")

# Ausgabe des Transkripts für Übergabe an Node.js:
print("📝 TRANSKRIPT_START")
print(result["text"])
print("📝 TRANSKRIPT_END")