#!/bin/bash

# Deploy Preparation Script
# This script helps prepare your app for deployment

echo "🚀 Store Rating System - Deployment Preparation"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check for .gitignore
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production
*/.env
*/.env.local
*/.env.production

# Build outputs
build/
dist/
*/build/
*/dist/

# Logs
*.log
npm-debug.log*
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
.nyc_output/
EOF
    echo "✅ .gitignore created"
fi

# Generate JWT Secret
echo ""
echo "🔐 Generating secure JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "Your JWT Secret (save this for production):"
echo "$JWT_SECRET"
echo ""

# Check if files are staged
echo "📋 Checking current status..."
git status

echo ""
echo "📝 Next steps:"
echo "1. Create a GitHub repository at https://github.com/new"
echo "2. Run these commands:"
echo ""
echo "   git add ."
echo "   git commit -m \"Initial commit - Store Rating System\""
echo "   git remote add origin https://github.com/YOUR_USERNAME/store-rating-system.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Follow DEPLOYMENT_GUIDE.md for platform-specific deployment"
echo "4. Use PRE_DEPLOYMENT_CHECKLIST.md to ensure everything is ready"
echo ""
echo "✅ Preparation complete!"
