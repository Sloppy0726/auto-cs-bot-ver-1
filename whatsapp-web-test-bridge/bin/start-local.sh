#!/usr/bin/env bash
set -euo pipefail

BRIDGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$BRIDGE_DIR/.." && pwd)"
LOG_DIR="$BRIDGE_DIR/logs"
mkdir -p "$LOG_DIR"

if [[ -f "$BRIDGE_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$BRIDGE_DIR/.env"
  set +a
fi

: "${HOST:=127.0.0.1}"
: "${PORT:=3000}"
: "${BOT_URL:=http://${HOST}:${PORT}/webhook}"
: "${WA_BRIDGE_BUSINESS_ID:=beauty_demo}"
: "${WA_BRIDGE_POLL_MS:=2500}"
: "${WA_BRIDGE_DRAFT_REPLIES:=true}"
: "${WA_BRIDGE_SEND_REPLIES:=false}"
: "${WA_BRIDGE_SEND_HELD_DRAFTS:=true}"
: "${WA_BRIDGE_REPLY_LATEST_ON_START:=false}"
: "${WA_BRIDGE_SERVER_SESSION:=auto-cs-bot-server}"
: "${WA_BRIDGE_SESSION:=auto-cs-whatsapp-web-bridge}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node 18+ before starting the bridge." >&2
  exit 1
fi

if ! command -v osascript >/dev/null 2>&1; then
  echo "This WhatsApp Web test bridge requires macOS Safari automation (osascript)." >&2
  exit 1
fi

if ! command -v screen >/dev/null 2>&1; then
  echo "screen is required by this starter script. Start server/bridge manually if unavailable." >&2
  exit 1
fi

SERVER_LOG="$LOG_DIR/server.log"
BRIDGE_LOG="$LOG_DIR/bridge.log"
BRIDGE_SCRIPT="$BRIDGE_DIR/src/whatsappWebBridge.js"

export HOST PORT BOT_URL WA_BRIDGE_BUSINESS_ID WA_BRIDGE_POLL_MS
export WA_BRIDGE_DRAFT_REPLIES WA_BRIDGE_SEND_REPLIES WA_BRIDGE_SEND_HELD_DRAFTS WA_BRIDGE_REPLY_LATEST_ON_START
export REPO_ROOT SERVER_LOG BRIDGE_LOG BRIDGE_SCRIPT

if curl -fsS --max-time 2 "$BOT_URL" >/dev/null 2>&1; then
  echo "Bot server already responds at $BOT_URL"
else
  screen -S "$WA_BRIDGE_SERVER_SESSION" -X quit >/dev/null 2>&1 || true
  screen -dmS "$WA_BRIDGE_SERVER_SESSION" bash -lc 'cd "$REPO_ROOT" && exec npm start >> "$SERVER_LOG" 2>&1'
  echo "Started bot server screen: $WA_BRIDGE_SERVER_SESSION"
fi

screen -S "$WA_BRIDGE_SESSION" -X quit >/dev/null 2>&1 || true
screen -dmS "$WA_BRIDGE_SESSION" bash -lc 'cd "$REPO_ROOT" && exec node "$BRIDGE_SCRIPT" >> "$BRIDGE_LOG" 2>&1'

echo "Started WhatsApp Web bridge screen: $WA_BRIDGE_SESSION"
echo "Logs:"
echo "  server: $SERVER_LOG"
echo "  bridge: $BRIDGE_LOG"
echo
echo "Make sure Safari is open at https://web.whatsapp.com/ and already logged in."
echo "Auto-send is WA_BRIDGE_SEND_REPLIES=$WA_BRIDGE_SEND_REPLIES"
