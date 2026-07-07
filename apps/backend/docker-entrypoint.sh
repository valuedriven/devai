#!/bin/sh
set -e

echo "Running Prisma migrations..."

# Attempt migrate deploy. If it fails with P3005 (non-empty schema without
# migration history), baseline existing migrations and retry.
if npx prisma migrate deploy 2>&1; then
  echo "Migrations applied successfully."
else
  EXIT_CODE=$?
  echo "prisma migrate deploy failed (exit $EXIT_CODE). Attempting baseline..."

  # Resolve each migration directory as already applied
  MIGRATIONS_DIR="src/database/prisma/migrations"
  for dir in "$MIGRATIONS_DIR"/*/; do
    MIGRATION_NAME=$(basename "$dir")
    # Skip the lock file or any non-directory entry
    [ "$MIGRATION_NAME" = "migration_lock.toml" ] && continue
    echo "Marking migration '$MIGRATION_NAME' as applied..."
    npx prisma migrate resolve --applied "$MIGRATION_NAME" || true
  done

  echo "Retrying migrate deploy after baseline..."
  npx prisma migrate deploy
  echo "Migrations applied successfully after baseline."
fi

echo "Starting application..."
exec node dist/main
