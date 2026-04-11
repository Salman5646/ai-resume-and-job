# AINN SLA — ML Service Startup Script (Windows PowerShell)
# Usage: .\start.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  AINN SLA — ML Service Launcher" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# 1. Create venv if missing
if (-not (Test-Path "venv")) {
    Write-Host "[1/4] Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
} else {
    Write-Host "[1/4] Virtual environment found." -ForegroundColor Green
}

# 2. Activate venv
Write-Host "[2/4] Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# 3. Install / upgrade requirements
Write-Host "[3/4] Installing requirements..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

# 4. Train model if not present
if (-not (Test-Path "model\resume_matcher.h5")) {
    Write-Host "[4/4] Model not found — training now (takes ~1-2 min)..." -ForegroundColor Yellow
    python train_model.py
} else {
    Write-Host "[4/4] Trained model found." -ForegroundColor Green
}

# 5. Launch FastAPI
Write-Host "`n🚀 Starting FastAPI on http://localhost:8000`n" -ForegroundColor Green
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
