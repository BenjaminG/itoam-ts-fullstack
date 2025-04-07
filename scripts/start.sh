#!/usr/bin/env bash

set -e

echo "🔄 Pulling Docker images..."
docker compose pull

echo "🔄 Starting PostgreSQL..."
docker compose up -d --wait postgres

echo "🔄 Migrating database..."
pnpm run -C packages/database drizzle-kit migrate

echo "🔄 Seeding database..."
pnpm run -C packages/database seed

docker compose up -d --build api web

echo "🚀 All services started successfully!"
echo "🌐 API: http://localhost:3000"
echo "🌐 Web: http://localhost:5173"
