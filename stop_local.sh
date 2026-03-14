#!/bin/bash

echo "🛑 Stopping Merico Spot Bar System..."

echo "Stopping Next.js server..."
pkill -f "next dev" || true
pkill -f "node.*next" || true

echo "Stopping local database..."
npx prisma dev stop default || true

echo "✅ All local services stopped."
