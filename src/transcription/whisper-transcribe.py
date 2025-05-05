import os
import whisper
from pathlib import Path
import torch
import argparse
import datetime

def transcribe(audio_path, output_dir=None):
    """
    Transcribes the given audio file using local Whisper.
    
    Args:
        audio_path (str): Path to the audio file.
        output_dir (str, optional): Directory to save the transcription.
        
    Returns:
        str: Transcribed text.
    """
    # Check if audio file exists
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    # Determine device
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    # Load model
    model = whisper.load_model("base", device=device)
    print("Whisper model loaded")
    
    # Transcribe audio
    result = model.transcribe(audio_path)
    print("Transcription complete")
    
    # Print transcription between markers for Node.js parsing
    print("\n📝 TRANSKRIPT_START")
    print(result["text"])
    print("📝 TRANSKRIPT_END\n")
    
    # Export transcription if output_dir is provided
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        audio_filename = os.path.basename(audio_path)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(output_dir, f"{os.path.splitext(audio_filename)[0]}_{timestamp}.txt")
        
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(result["text"])
        print(f"Transcription exported to: {output_file}")
    
    return result["text"]

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Transcribe audio using local Whisper")
    parser.add_argument("audio_path", type=str, help="Path to the audio file")
    parser.add_argument("--output", "-o", type=str, help="Directory to save the transcription", default=None)
    
    args = parser.parse_args()
    
    try:
        text = transcribe(args.audio_path, args.output)
    except FileNotFoundError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")