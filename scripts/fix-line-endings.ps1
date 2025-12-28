#!/usr/bin/env pwsh
# Fix Line Endings - Quick Script
# Run: .\scripts\fix-line-endings.ps1

Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🔧 Fix Line Endings (CRLF → LF)                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Git config
Write-Host "📌 Step 1: Checking Git configuration..." -ForegroundColor Yellow
$autocrlf = git config core.autocrlf
$eol = git config core.eol

if ($autocrlf -ne "false") {
    Write-Host "   ⚠️  Setting core.autocrlf = false" -ForegroundColor Yellow
    git config core.autocrlf false
}

if ($eol -ne "lf") {
    Write-Host "   ⚠️  Setting core.eol = lf" -ForegroundColor Yellow
    git config core.eol lf
}

Write-Host "   ✅ Git config: autocrlf=$((git config core.autocrlf)), eol=$((git config core.eol))" -ForegroundColor Green
Write-Host ""

# Step 2: Fix all files
Write-Host "📌 Step 2: Fixing line endings in all files..." -ForegroundColor Yellow
Write-Host "   (This may take 10-30 seconds)" -ForegroundColor Gray
Write-Host ""

npm run format:fix-line-endings

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ Done! All files now use LF line endings       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test: Open any .ts file and Save (Ctrl+S)" -ForegroundColor White
Write-Host "  2. Should auto-format without 'Delete CR' errors" -ForegroundColor White
Write-Host "  3. Commit: git add . && git commit -m 'chore: fix line endings'" -ForegroundColor White
Write-Host ""
