#!/usr/bin/env bash
set -euo pipefail

BRIDGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRIDGE_SCRIPT="$BRIDGE_DIR/src/whatsappWebBridge.js"
BRIDGE_SCRIPT_REAL="$(cd "$(dirname "$BRIDGE_SCRIPT")" && pwd)/$(basename "$BRIDGE_SCRIPT")"
REPO_ROOT="$(cd "$BRIDGE_DIR/.." && pwd)"
SERVER_SCRIPT="$REPO_ROOT/end-to-end pipeline ver 1.0/src/server.js"
SERVER_SCRIPT_REAL="$(cd "$(dirname "$SERVER_SCRIPT")" && pwd)/$(basename "$SERVER_SCRIPT")"
SERVER_SCRIPT_PATTERN="end-to-end pipeline ver 1.0/src/server.js"

if [[ -f "$BRIDGE_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$BRIDGE_DIR/.env"
  set +a
fi

: "${WA_BRIDGE_SERVER_SESSION:=auto-cs-bot-server}"
: "${WA_BRIDGE_SESSION:=auto-cs-whatsapp-web-bridge}"

screen -S "$WA_BRIDGE_SESSION" -X quit >/dev/null 2>&1 || true
pkill -f "$BRIDGE_SCRIPT_REAL" >/dev/null 2>&1 || true
screen -S "$WA_BRIDGE_SERVER_SESSION" -X quit >/dev/null 2>&1 || true
pkill -f "$SERVER_SCRIPT_REAL" >/dev/null 2>&1 || true
pkill -f "$SERVER_SCRIPT_PATTERN" >/dev/null 2>&1 || true

echo "Stopped packaged bridge screens if they were running:"
echo "  $WA_BRIDGE_SESSION"
echo "  $WA_BRIDGE_SERVER_SESSION"
