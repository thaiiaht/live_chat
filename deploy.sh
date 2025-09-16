#!/bin/bash
set -e

# Load nvm environment
export NVM_DIR="/root/.nvm"
export PATH="/usr/bin:$PATH"
source "$NVM_DIR/nvm.sh"

NODE_ENV="production"


echo "🔹 Cập nhật code mới nhất"
git fetch && git reset --hard origin/main && git pull origin main

echo "🔹 Cài dependencies (production only)..."
pnpm install

echo "🔹 Build project..."
npm run build

echo "🔹 Copy file .env vào build..."
cp .env build/

echo "🔹 Start/Reload PM2 bằng eco file..."
pm2 delete ecosystem.config.cjs
pm2 start ecosystem.config.cjs --env $NODE_ENV

echo "🔹 5. Lưu cấu hình PM2..."
pm2 save

echo "✅ Deploy thành công!"