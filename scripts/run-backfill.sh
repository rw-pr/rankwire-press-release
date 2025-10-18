#!/bin/bash

# Quick script to run the PR ID backfill
# Usage: ./scripts/run-backfill.sh

set -e

echo "========================================="
echo "RankWire PR ID Backfill Script"
echo "========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it using one of these methods:"
    echo "  1. Export it: export DATABASE_URL='your-database-url'"
    echo "  2. Use .env file: Create a .env file with DATABASE_URL"
    echo "  3. Run with inline variable: DATABASE_URL='your-url' ./scripts/run-backfill.sh"
    echo ""
    exit 1
fi

echo "✓ DATABASE_URL is set"
echo ""

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo "⚠️  tsx not found, installing dependencies..."
    pnpm install
    echo ""
fi

echo "Running backfill script..."
echo "========================================="
echo ""

npx tsx scripts/backfill-pr-ids.ts

echo ""
echo "========================================="
echo "✓ Backfill complete!"
echo "========================================="

