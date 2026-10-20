#!/usr/bin/env bash
cd "$(dirname "$0")/.." || exit 1

# Serveur camera : POST /shutdown (marche aussi pour un python.exe sous Windows, que killall ne voit pas).
# Adresse : CAMERA_URL, sinon CAMERA_HOST / CAMERA_PORT du .env, sinon http://localhost:8000
if [ -z "$CAMERA_URL" ] && [ -f .env ]; then
	HOST=$(grep -E '^CAMERA_HOST' .env | cut -d= -f2 | tr -d ' \r"')
	PORT=$(grep -E '^CAMERA_PORT' .env | cut -d= -f2 | tr -d ' \r"')
	[ -n "$HOST" ] && CAMERA_URL="http://$HOST:${PORT:-8000}"
fi
curl -s -m 2 -X POST "${CAMERA_URL:-http://localhost:8000}/shutdown" >/dev/null 2>&1

killall P-II.camera 2>/dev/null
killall P-II.simulator 2>/dev/null
exit 0
