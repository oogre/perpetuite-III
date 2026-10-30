#!/bin/bash

ENV=/home/perpetuite/perpetuite-III/simulator/P-II/.env
SD=/mnt/c/Windows/System32/shutdown.exe
LOG=/home/perpetuite/p2.log
BOOTS=/home/perpetuite/reboots.log
STRIP='s/\x1B\[[0-9;?]*[ -\/]*[@-~]//g; s/\x1B\][^\x07]*\x07//g; s/\r//g'

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /home/perpetuite/perpetuite-III/simulator/P-II || exit 1
echo "=== $(date) : démarrage ===" >> /home/perpetuite/p2.log


npm run start 2>&1 | tee >(sed -u -E "$STRIP" >> "$LOG")
code=${PIPESTATUS[0]}
sleep 0.3          # laisse sed finir d'écrire avant les messages suivants dans le log


# AUTO_POWER du .env : absent ou différent de 0 => actif
AUTO_POWER=$(grep -E '^AUTO_POWER' "$ENV" 2>/dev/null | cut -d= -f2 | tr -d ' \r"')
AUTO_POWER=${AUTO_POWER:-1}

if [ "$AUTO_POWER" = "0" ]; then
	echo "=== $(date) : code $code, AUTO_POWER=0 : ni extinction ni redémarrage ===" >> "$LOG"
	exit "$code"
fi


case "$code" in
	42)                                   # arrêt d'urgence : extinction
		echo "=== $(date) : E-STOP (42), extinction ===" >> "$LOG"
		"$SD" /s /f /t 0
		;;
	0)                                    # arrêt volontaire (Ctrl+C, stop.sh) : rien
		echo "=== $(date) : arrêt normal (0) ===" >> "$LOG"
		;;
	*)                                    # toute autre sortie : redémarrage forcé, sauf boucle
		now=$(date +%s)
		echo "$now" >> "$BOOTS"
		recent=$(awk -v n="$now" 'n-$1 < 600' "$BOOTS" | wc -l)   # redémarrages des 10 dernières minutes
		if [ "$recent" -gt 3 ]; then
			echo "=== $(date) : code $code, $recent redémarrages en 10 min : pas de redémarrage (boucle) ===" >> "$LOG"
		else
			echo "=== $(date) : code $code, redémarrage forcé ===" >> "$LOG"
			"$SD" /r /f /t 0
		fi
		;;
esac