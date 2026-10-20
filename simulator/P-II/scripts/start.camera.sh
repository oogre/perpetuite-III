#!/usr/bin/env bash
#
# Lance cv/camera_server.py EN ARRIERE-PLAN et rend la main des qu'il repond.
# (Camera/Base.js attend la fin de ce script : un serveur lance au premier plan le bloquerait pour toujours.)
#
#   journal         : log/camera.log  (le serveur y ecrit lui-meme ; ce qui sort avant lui y arrive aussi)
#   options serveur : npm run start.camera -- --simulate
#   CAMERA_URL      : adresse du serveur, pour savoir s'il tourne deja (defaut http://localhost:8000)
#   CAMERA_IDLE_EXIT: secondes sans requete avant que le serveur s'arrete seul (defaut 30, 0 = jamais)
#   CAMERA_PYTHON   : interpreteur (defaut : python.exe sous WSL s'il existe -> camera Daheng sous Windows,
#                     sinon python3)

cd "$(dirname "$0")/.." || exit 1          # racine de P-II, d'ou qu'on soit lance
URL="${CAMERA_URL:-http://localhost:8000}"
LOG=log/camera.log
mkdir -p log

# pgrep ne voit pas un processus Windows : on interroge le serveur
if curl -fs --max-time 1 "$URL/health" >/dev/null 2>&1; then
	echo "P-II.camera is already started"
	exit 0
fi

PY="${CAMERA_PYTHON:-}"
if [ -z "$PY" ]; then
	if command -v python.exe >/dev/null 2>&1; then PY=python.exe; else PY=python3; fi
fi

SCRIPT=cv/camera_server.py
# Le serveur s'arrete seul si P-II ne donne plus signe de vie (P-II envoie un ping toutes les 5 s) : CAMERA_IDLE_EXIT, 30 s
# par defaut, 0 = jamais. Les options passees a ce script viennent apres et l'emportent.
ARGS=(--idle-exit "${CAMERA_IDLE_EXIT:-30}")
case "$PY" in
	*.exe)
		SCRIPT=$(wslpath -w "$PWD/cv/camera_server.py")
		ARGS+=(--host 0.0.0.0)              # joignable depuis WSL
		;;
esac

echo "$(date '+%F %T') start.camera.sh : $PY $SCRIPT ${ARGS[*]} $*" >> "$LOG"

# Detache vraiment : nohup + setsid, entree fermee, sortie et erreurs dans le journal.
# (sans ces redirections le processus garde le tuyau de `exec` ouvert et l'appelant n'est jamais libere)
nohup setsid "$PY" -u "$SCRIPT" "${ARGS[@]}" "$@" >> "$LOG" 2>&1 < /dev/null &
disown

# attend (8 s max) que le serveur reponde
for _ in $(seq 1 32); do
	if curl -fs --max-time 1 "$URL/health" >/dev/null 2>&1; then
		echo "P-II.camera started (log: $LOG)"
		exit 0
	fi
	sleep 0.25
done
echo "P-II.camera does not answer on $URL, last lines of $LOG :" >&2
tail -n 8 "$LOG" >&2
exit 1
