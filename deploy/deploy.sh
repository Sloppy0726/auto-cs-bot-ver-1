#!/usr/bin/env bash
# deploy.sh — pull latest, run smoke tests, restart the bot service.
#
# Usage (on a shop's box, as the cs-bot user):
#     /opt/cs-bot/deploy/deploy.sh
#
# Also used by .github/workflows/deploy.yml via SSH.
#
# Requires a sudoers entry allowing the cs-bot user to run
# `systemctl restart cs-bot` and `systemctl status cs-bot`
# without a password. See deploy/cs-bot.sudoers.
#
# Designed to be safe to run unattended (e.g. from cron or CI). If the
# smoke tests fail, the service is NOT restarted and the script exits
# non-zero so the operator gets a clear signal.

set -euo pipefail

APP_DIR="${CS_BOT_DIR:-/opt/cs-bot}"
SERVICE="${CS_BOT_SERVICE:-cs-bot}"
BRANCH="${CS_BOT_BRANCH:-main}"

cd "$APP_DIR"

echo "[deploy] fetching origin..."
git fetch --quiet origin

CURRENT=$(git rev-parse --short HEAD)
TARGET=$(git rev-parse --short "origin/$BRANCH")

if [ "$CURRENT" = "$TARGET" ]; then
  echo "[deploy] already at $CURRENT on $BRANCH; nothing to do"
  exit 0
fi

echo "[deploy] updating $CURRENT -> $TARGET on $BRANCH"
git checkout --quiet "$BRANCH"
git pull --quiet --ff-only origin "$BRANCH"

echo "[deploy] running smoke tests..."
NODE_ENV=test node "end-to-end pipeline ver 1.0/test/pipeline.test.js" > /tmp/cs-bot-deploy.log
NODE_ENV=test node "end-to-end pipeline ver 1.0/test/server.test.js" >> /tmp/cs-bot-deploy.log
echo "[deploy] smoke tests passed"

echo "[deploy] restarting $SERVICE..."
sudo -n systemctl restart "$SERVICE"
sleep 2
sudo -n systemctl --no-pager --lines=5 status "$SERVICE" || true

NEW=$(git rev-parse --short HEAD)
echo "[deploy] done: now at $NEW (was $CURRENT)"
