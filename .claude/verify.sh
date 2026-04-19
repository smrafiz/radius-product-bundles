#!/usr/bin/env bash
# Project verification — runs on Claude stop
# Fails fast: type-check then test

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "→ Type check..."
cd web && bunx tsc --noEmit 2>&1
cd ..

echo "→ Tests..."
cd web && bunx jest 2>&1
