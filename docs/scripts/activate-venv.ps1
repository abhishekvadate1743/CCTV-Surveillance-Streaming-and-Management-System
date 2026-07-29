# Quick activation script for PowerShell
# Usage: .\activate-venv.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Activating Python Virtual Environment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

if (Test-Path ".\venv\Scripts\Activate.ps1") {
    & .\venv\Scripts\Activate.ps1
    Write-Host "✓ Virtual environment activated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Python version:" -ForegroundColor Yellow
    python --version
    Write-Host ""
    Write-Host "Installed packages:" -ForegroundColor Yellow
    pip list --format=columns | Select-Object -First 15
    Write-Host ""
    Write-Host "To run services:" -ForegroundColor Cyan
    Write-Host "  python services/stream_service.py" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERROR: venv not found!" -ForegroundColor Red
    Write-Host "Run setup-venv.ps1 first" -ForegroundColor Red
}
