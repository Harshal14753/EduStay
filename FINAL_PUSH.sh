#!/bin/bash
# FINAL_PUSH.sh - Automated push script for Unix/MacOS
# This script completes the git push to GitHub

set -e  # Exit on any error

echo "========================================="
echo "EduStay - Automated GitHub Push Script"
echo "========================================="
echo ""

# Change to project directory
cd "$(dirname "$0")" || exit 1

# Verify git is initialized
if [ ! -d ".git" ]; then
    echo "❌ ERROR: Git repository not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Check if remote exists
REMOTE_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo "❌ ERROR: Remote 'origin' not configured!"
    echo "Configuring remote: https://github.com/rohitkatore/edustay.git"
    git remote add origin https://github.com/rohitkatore/edustay.git
fi

echo "📤 Remote URL: $REMOTE_URL"
echo ""

# Show status
echo "📊 Repository Status:"
echo "   Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "   Commits: $(git rev-list --count HEAD)"
echo "   Files: $(git ls-files | wc -l | tr -d ' ')"
echo "   Working tree: $(git status --porcelain | wc -l | tr -d ' ') changes"
echo ""

# Verify working tree is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  WARNING: You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Push cancelled."
        exit 1
    fi
fi

# Attempt push
echo "🚀 Pushing to GitHub..."
echo ""

if git push -u origin main; then
    echo ""
    echo "✅ SUCCESS! Project pushed to GitHub!"
    echo ""
    echo "📍 View your repository at:"
    echo "   https://github.com/rohitkatore/edustay"
    echo ""
    echo "🔗 Share with others:"
    echo "   git clone https://github.com/rohitkatore/edustay.git"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common reasons:"
    echo "   1. Repository doesn't exist on GitHub (create at https://github.com/new)"
    echo "   2. Not authenticated (set up GitHub CLI, PAT, or SSH)"
    echo "   3. No internet connection"
    echo ""
    echo "📖 See FINAL_PUSH_STEPS.md for detailed troubleshooting."
    exit 1
fi
