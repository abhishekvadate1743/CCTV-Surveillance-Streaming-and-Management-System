@echo off
echo ==========================================
echo Activating Python Virtual Environment
echo ==========================================
echo.

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo.
    echo ✓ Virtual environment activated!
    echo.
    python --version
    echo.
    echo To run services:
    echo   python services/stream_service.py
    echo.
) else (
    echo ERROR: venv not found!
    echo Run setup-venv.bat first
    echo.
)
