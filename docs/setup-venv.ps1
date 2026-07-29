# CCTV Surveillance System - Python venv Setup (PowerShell)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "CCTV Surveillance System - venv Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create virtual environment
Write-Host "Step 1: Creating Python virtual environment..." -ForegroundColor Yellow
python -m venv venv

Write-Host ""

# Step 2: Activate virtual environment
Write-Host "Step 2: Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host ""

# Step 3: Upgrade pip
Write-Host "Step 3: Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

Write-Host ""

# Step 4: Install dependencies
Write-Host "Step 4: Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To activate venv in future:" -ForegroundColor Cyan
Write-Host "  PowerShell: .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  CMD: venv\Scripts\activate.bat" -ForegroundColor White
Write-Host ""
Write-Host "To deactivate venv:" -ForegroundColor Cyan
Write-Host "  deactivate" -ForegroundColor White
Write-Host ""
Write-Host "To run Python scripts:" -ForegroundColor Cyan
Write-Host "  python <script_name>.py" -ForegroundColor White
Write-Host ""
