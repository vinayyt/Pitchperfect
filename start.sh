#!/bin/bash
# Pitch Perfect — local dev startup
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Installing server deps..."
npm install --prefix "$ROOT/server" --silent

echo "📦 Installing client deps..."
npm install --prefix "$ROOT/client" --silent

echo ""
echo "🚀 Starting Pitch Perfect..."
echo "   Backend  → http://localhost:3001"
echo "   Frontend → http://localhost:5173"
echo ""
echo "Open http://localhost:5173 in your browser."
echo "Press Ctrl+C to stop both servers."
echo ""

# Start backend
node "$ROOT/server/index.js" &
SERVER_PID=$!

# Start Vite dev server
npm run dev --prefix "$ROOT/client" &
VITE_PID=$!

# Kill both on exit
trap "kill $SERVER_PID $VITE_PID 2>/dev/null" EXIT INT TERM
wait
