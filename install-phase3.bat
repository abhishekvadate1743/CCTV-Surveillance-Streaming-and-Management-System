@echo off
cd /d "c:\Users\abhis\OneDrive\Desktop\CCTV-Surveillance-Streaming-and-Management-System"
call venv\Scripts\activate.bat
pip install av streamlink ffmpeg-python m3u8 --quiet
echo Phase 3 Python packages installed successfully
pause
