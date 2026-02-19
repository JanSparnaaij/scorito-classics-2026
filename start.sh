#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/packages/db
pnpm prisma migrate deploy

echo "Starting server..."
cd /app
pnpm --filter server exec tsx src/index.ts
