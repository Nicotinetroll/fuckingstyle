#!/bin/bash
echo "📦 Pulling latest changes..."
git pull origin main

echo "🔧 Installing backend dependencies..."
cd backend && pnpm install && pnpm build

echo "🎨 Building frontend..."
cd ../frontend && pnpm install && pnpm build

echo "🚀 Restarting backend..."
pm2 restart voting-backend

echo "✅ Deploy complete! Check https://fucking.style"
