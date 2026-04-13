# EduStay Project - Quick Push to GitHub (Windows PowerShell)
# Run this script after creating the repository on GitHub

Write-Host "🚀 EduStay - Ready to Push to GitHub" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Git Status:" -ForegroundColor Cyan
git log --oneline -3
Write-Host ""

Write-Host "✅ Branch: $(git rev-parse --abbrev-ref HEAD)" -ForegroundColor Cyan
git remote -v | Select-Object -First 1 | ForEach-Object { Write-Host "✅ Remote: $_" -ForegroundColor Cyan }
Write-Host ""

$fileCount = (git ls-files | Measure-Object -Line).Lines
Write-Host "✅ Files Ready to Push: $fileCount files" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  BEFORE RUNNING: Create repository at https://github.com/new" -ForegroundColor Yellow
Write-Host "   Repository name: edustay" -ForegroundColor Yellow
Write-Host "   Do NOT initialize with README" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔑 Choose authentication method:" -ForegroundColor Magenta
Write-Host "   1. GitHub CLI:" -ForegroundColor White
Write-Host "      gh auth login" -ForegroundColor Gray
Write-Host "      git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. PAT Token (Personal Access Token):" -ForegroundColor White
Write-Host "      git push -u origin main" -ForegroundColor Gray
Write-Host "      (enter token when prompted)" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. SSH Key:" -ForegroundColor White
Write-Host "      git remote set-url origin git@github.com:rohitkatore/edustay.git" -ForegroundColor Gray
Write-Host "      git push -u origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "📤 To push now, run:" -ForegroundColor Green
Write-Host '   git push -u origin main' -ForegroundColor Cyan
Write-Host ""
