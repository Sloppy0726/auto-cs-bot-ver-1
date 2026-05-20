#!/usr/bin/env bash
set -euo pipefail

BRIDGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$BRIDGE_DIR/logs"

if [[ -f "$BRIDGE_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$BRIDGE_DIR/.env"
  set +a
fi

: "${HOST:=127.0.0.1}"
: "${PORT:=3000}"
: "${BOT_URL:=http://${HOST}:${PORT}/webhook}"

echo "Screens:"
screen -ls || true
echo

echo "Bot endpoint:"
if curl -fsS --max-time 2 "$BOT_URL" >/dev/null 2>&1; then
  echo "  OK $BOT_URL"
else
  echo "  Not responding $BOT_URL"
fi
echo

echo "Recent bridge log:"
tail -n 40 "$LOG_DIR/bridge.log" 2>/dev/null || echo "  No bridge log yet."
echo

echo "Recent server log:"
tail -n 20 "$LOG_DIR/server.log" 2>/dev/null || echo "  No server log yet."
