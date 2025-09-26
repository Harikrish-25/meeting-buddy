import sounddevice as sd
import numpy as np
import whisper
import queue
import threading
import json
import os
from datetime import datetime

# Settings
SAMPLE_RATE = 16000  # Whisper expects 16kHz
CHUNK_DURATION = 5    # seconds per chunk
MODEL_NAME = 'base'   # Whisper model
JSON_FILE = 'transcriptions.json'
"""
Streaming Speech-to-Text with Whisper Tiny Model
 Model: tiny (fastest, least accurate)
"""

# Load Whisper model
model = whisper.load_model(MODEL_NAME)

# Queue for audio chunks
audio_queue = queue.Queue()

stop_recording = threading.Event()

# Function to listen for quit command in terminal
def listen_for_quit():
    print("Type 'q' and press Enter at any time to quit.")
    while not stop_recording.is_set():
        user_input = input()
        if user_input.strip().lower() == 'q':
            stop_recording.set()
            print("Quit command received. Stopping...")
            break

# Function to record audio chunks
def record_chunks():
    print(f"Recording {CHUNK_DURATION}s chunks. Press Ctrl+C or use the Quit button to stop.")
    while not stop_recording.is_set():
        print("Speak now...")
        audio = sd.rec(int(CHUNK_DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='float32')
        sd.wait()
        audio_queue.put(audio.flatten())
    print("Recording stopped.")

# Function to transcribe audio chunks
def transcribe_chunks():
    # Load or create the JSON file
    # Load or create the JSON file
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                loaded = json.load(f)
            if isinstance(loaded, dict):
                all_sessions = loaded
            else:
                all_sessions = {}
        except Exception:
            all_sessions = {}
    else:
        all_sessions = {}

    # Determine new session name
    session_num = len(all_sessions) + 1
    session_name = f"recording-{session_num}"
    start_time = datetime.now().isoformat()
    all_sessions[session_name] = {
        "start": start_time,
        "end": None,
        "transcriptions": []
    }

    chunk_count = 1
    while True:
        audio = audio_queue.get()
        if audio is None:
            break
        print("Transcribing...")
        result = model.transcribe(audio, language='en', fp16=False)
        print("Transcription:", result['text'])
        text = result['text']
        # Save to session
        all_sessions[session_name]["transcriptions"].append({
            "chunk": chunk_count,
            "text": text
        })
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_sessions, f, ensure_ascii=False, indent=2)
        chunk_count += 1

    # Set end timestamp when quitting
    all_sessions[session_name]["end"] = datetime.now().isoformat()
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_sessions, f, ensure_ascii=False, indent=2)


# Start recording and transcribing in parallel
rec_thread = threading.Thread(target=record_chunks)
trans_thread = threading.Thread(target=transcribe_chunks)
quit_thread = threading.Thread(target=listen_for_quit)
rec_thread.start()
trans_thread.start()
quit_thread.start()
rec_thread.join()
audio_queue.put(None)
trans_thread.join()
