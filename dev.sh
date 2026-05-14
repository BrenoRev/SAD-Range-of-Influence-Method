#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

if [ ! -d "$BACKEND/.venv" ]; then
  echo "[setup] criando venv do backend..."
  python3.13 -m venv "$BACKEND/.venv"
  "$BACKEND/.venv/bin/pip" install -e "$BACKEND[dev]"
fi

if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "[setup] instalando deps do frontend..."
  (cd "$FRONTEND" && pnpm install)
fi

cleanup() {
  echo ""
  echo "[stop] encerrando..."
  kill "${BACK_PID:-}" "${FRONT_PID:-}" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[backend] uvicorn :8000"
(cd "$BACKEND" && .venv/bin/uvicorn app.main:app --reload --port 8000) &
BACK_PID=$!

echo "[frontend] vite :5173"
(cd "$FRONTEND" && pnpm dev) &
FRONT_PID=$!

echo ""
echo "  backend  → http://localhost:8000/docs"
echo "  frontend → http://localhost:5173"
echo ""
echo "Ctrl+C para parar os dois."

wait
