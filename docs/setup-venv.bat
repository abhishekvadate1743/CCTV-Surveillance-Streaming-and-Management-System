@echo off
echo =========================================
echo CCTV Surveillance System - venv Setup
echo =========================================
echo.

echo Step 1: Creating Python virtual environment...
python -m venv venv

echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Step 3: Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Step 4: Installing Python dependencies...
pip install -r requirements.txt

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo To activate venv in future:
echo   Windows: venv\Scripts\activate.bat
echo   PowerShell: .\venv\Scripts\Activate.ps1
echo.
echo To deactivate venv:
echo   deactivate
echo.
echo To run Python scripts:
echo   python <script_name>.py
echo.
pause
