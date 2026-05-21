# OrbitX Setup Script
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OrbitX Institutional Trading Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectPath = $PSScriptRoot
if (-not $ProjectPath) { $ProjectPath = Get-Location }

Set-Location $ProjectPath

Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Step 2: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma client!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Open your browser to: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Admin credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@cryptovault.io" -ForegroundColor White
Write-Host "  Password: supersecretadmin" -ForegroundColor White
Write-Host ""
Write-Host "User credentials:" -ForegroundColor Yellow
Write-Host "  Email: user1@example.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""

npm run dev