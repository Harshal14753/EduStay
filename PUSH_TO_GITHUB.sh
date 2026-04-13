#!/usr/bin/env bash
# EduStay Project - Quick Push to GitHub
# Run this script after creating the repository on GitHub

echo "🚀 EduStay - Ready to Push to GitHub"
echo "===================================="
echo ""
echo "✅ Git Status:"
git log --oneline -3
echo ""
echo "✅ Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "✅ Remote: $(git remote -v | head -1)"
echo ""
echo "📋 Files Ready to Push:"
git ls-files | wc -l
echo "files"
echo ""
echo "⚠️  BEFORE RUNNING: Create repository at https://github.com/new"
echo "   Repository name: edustay"
echo "   Do NOT initialize with README"
echo ""
echo "🔑 Choose authentication method:"
echo "   1. GitHub CLI:       gh auth login && git push -u origin main"
echo "   2. PAT Token:        git push -u origin main (enter token when prompted)"
echo "   3. SSH Key:          git remote set-url origin git@github.com:rohitkatore/edustay.git && git push -u origin main"
echo ""
echo "To push now, run:"
echo "   git push -u origin main"
echo ""
