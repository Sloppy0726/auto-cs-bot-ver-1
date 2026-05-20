#!/usr/bin/env bash
set -euo pipefail

BRIDGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$BRIDGE_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$BRIDGE_DIR/.env"
  set +a
fi

: "${WA_BRIDGE_SERVER_SESSION:=auto-cs-bot-server}"
: "${WA_BRIDGE_SESSION:=auto-cs-whatsapp-web-bridge}"

screen -S "$WA_BRIDGE_SESSION" -X quit >/dev/null 2>&1 || true
screen -S "$WA_BRIDGE_SERVER_SESSION" -X quit >/dev/null 2>&1 || true

echo "Stopped packaged bridge screens if they were running:"
echo "  $WA_BRIDGE_SESSION"
echo "  $WA_BRIDGE_SERVER_SESSION"
