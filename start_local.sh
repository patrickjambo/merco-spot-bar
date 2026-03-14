#!/bin/bash
set -e

echo "🚀 Starting Merico Spot Bar System Locally..."

# 1. Check if Prisma local DB is running, start if not
if ! npx prisma dev ls | grep -q "TCP:"; then
  echo "📦 Starting zero-dependency local database via Prisma Dev..."
  npx prisma dev start default

  echo "⏳ Waiting for local database to be ready..."
  for i in {1..30}; do
    if nc -z 127.0.0.1 51214; then
      echo "✅ Database is ready on port 51214!"
      break
    fi
    sleep 1
  done
else
  echo "📦 Local database already running."
fi

# 2. Guarantee the safe TCP Postgres link logic in .env
echo 'DATABASE_URL="postgres://postgres:postgres@127.0.0.1:51214/template1?sslmode=disable"' > .env

# 3. Generate Prisma client & push schema
echo "⚙️  Syncing database schema..."
npx prisma generate
npx prisma db push --accept-data-loss

# 4. Schedule automatic database seed
echo "🌱 Scheduling database seed task..."
(sleep 10 && curl -s http://localhost:3000/api/seed > /dev/null && echo "✅ Seed executed.") &

# 5. Start Frontend
echo "🌐 Starting Next.js Dev Server (open http://localhost:3000)..."
npm run dev
