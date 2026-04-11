Write-Host "💎 Starting JewelFit 3D Development Environment..." -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "🚀 Starting Frontend and Backend..." -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:4000 (Requires Postgres)" -ForegroundColor Cyan

# Use the root package.json dev script which handles concurrency reliably
npm run dev
