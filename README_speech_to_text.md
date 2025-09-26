# Streaming Speech-to-Text with Whisper Tiny Model

This project provides a simple Python script for live speech-to-text transcription using OpenAI's Whisper tiny model. It records short audio segments from your microphone and transcribes them in near real-time.

## Features
- Records audio from your microphone in 5-second chunks
- Transcribes each chunk using Whisper (tiny model)
- Prints transcribed text to the console
- Works on Windows, macOS, and Linux
- Uses `sounddevice` and `numpy` for easy installation

## Requirements
- Python 3.8+
- [ffmpeg](https://www.gyan.dev/ffmpeg/builds/) (must be installed and in your PATH)
- Python packages: `sounddevice`, `numpy`, `openai-whisper`

## Installation
1. **Install Python**
   - Download from https://www.python.org/downloads/
   - Add Python to PATH during installation

2. **Install ffmpeg**
   - Download and extract from https://www.gyan.dev/ffmpeg/builds/
   - Add the `bin` folder to your system PATH
   - Verify installation:
     ```powershell
     ffmpeg -version
     ```

3. **Install Python dependencies**
   ```powershell
   pip install sounddevice numpy openai-whisper
   ```

## Usage
1. Run the script:
   ```powershell
   python streaming_whisper.py
   ```
2. Speak into your microphone. The script will record and transcribe in 5-second intervals.
3. Transcribed text will appear in the console.
4. Press `Ctrl+C` to stop recording.

## Customization
- Change `CHUNK_DURATION` in the script to adjust the recording interval.
- Change `MODEL_NAME` to use other Whisper models (`base`, `small`, `medium`, `large`) for different accuracy/speed.

## Troubleshooting
- If you get errors with microphone access, ensure your device is connected and permissions are granted.
- If Whisper fails to load, check your Python and ffmpeg installation.
- For PyAudio issues, this script uses `sounddevice` for easier installation.

## License
MIT

## Credits
- [OpenAI Whisper](https://github.com/openai/whisper)
- [sounddevice](https://python-sounddevice.readthedocs.io/)
- [numpy](https://numpy.org/)

---

Feel free to modify the script for your own use cases!
