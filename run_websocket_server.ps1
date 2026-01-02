# PowerShell script to run the Django/Channels development server with Daphne
# This enables WebSocket support for real-time game updates

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Django/Channels Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ This server supports WebSocket connections" -ForegroundColor Green
Write-Host "✓ Connect to: ws://localhost:8000/ws/game/{game_id}/" -ForegroundColor Green
Write-Host ""

cd C:\Users\unico\thegame\api

# Activate virtual environment
& .\..\..\thegame\Scripts\Activate.ps1

# Check if daphne is installed
$daphneCheck = python -m pip list | Select-String "daphne"
if (-not $daphneCheck) {
    Write-Host "Installing Daphne ASGI server..." -ForegroundColor Yellow
    python -m pip install daphne
}

# Run Daphne with Django settings
Write-Host ""
Write-Host "Starting server on http://127.0.0.1:8000/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

python -m daphne -b 127.0.0.1 -p 8000 api.asgi:application
