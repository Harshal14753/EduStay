# FINAL_PUSH.ps1 - Automated push script for Windows PowerShell
# This script completes the git push to GitHub

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Green
Write-Host "EduStay - Automated GitHub Push Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Get project directory
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

# Verify git is initialized
if (!(Test-Path ".git")) {
    Write-Host "❌ ERROR: Git repository not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory."
    exit 1
}

Write-Host "✅ Git repository found" -ForegroundColor Green
Write-Host ""

# Check if remote exists
try {
    $RemoteUrl = & git config --get remote.origin.url 2>$null
} catch {
    $RemoteUrl = ""
}

if ([string]::IsNullOrEmpty($RemoteUrl)) {
    Write-Host "⚠️  Remote 'origin' not configured. Configuring now..." -ForegroundColor Yellow
    & git remote add origin https://github.com/rohitkatore/edustay.git
    $RemoteUrl = "https://github.com/rohitkatore/edustay.git"
}

Write-Host "📤 Remote URL: $RemoteUrl" -ForegroundColor Cyan
Write-Host ""

# Show status
$Branch = & git rev-parse --abbrev-ref HEAD
$CommitCount = & git rev-list --count HEAD
$FileCount = (& git ls-files | Measure-Object -Line).Lines
$Changes = (& git status --porcelain | Measure-Object -Line).Lines

Write-Host "📊 Repository Status:" -ForegroundColor Cyan
Write-Host "   Branch: $Branch"
Write-Host "   Commits: $CommitCount"
Write-Host "   Files: $FileCount"
Write-Host "   Pending changes: $Changes"
Write-Host ""

# Verify working tree is clean
$Status = & git status --porcelain
if ($Status) {
    Write-Host "⚠️  WARNING: You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $Status
    Write-Host ""
    $Response = Read-Host "Continue anyway? (y/n)"
    if ($Response -ne "y" -and $Response -ne "Y") {
        Write-Host "❌ Push cancelled." -ForegroundColor Red
        exit 1
    }
}

# Attempt push
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Green
Write-Host ""

try {
    & git push -u origin main
    
    Write-Host ""
    Write-Host "✅ SUCCESS! Project pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 View your repository at:" -ForegroundColor Cyan
    Write-Host "   https://github.com/rohitkatore/edustay"
    Write-Host ""
    Write-Host "🔗 Share with others:" -ForegroundColor Cyan
    Write-Host "   git clone https://github.com/rohitkatore/edustay.git"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ Push failed. Common reasons:" -ForegroundColor Red
    Write-Host "   1. Repository doesn't exist on GitHub (create at https://github.com/new)"
    Write-Host "   2. Not authenticated (set up GitHub CLI, PAT, or SSH)"
    Write-Host "   3. No internet connection"
    Write-Host ""
    Write-Host "See FINAL_PUSH_STEPS.md for detailed troubleshooting." -ForegroundColor Yellow
    exit 1
}
