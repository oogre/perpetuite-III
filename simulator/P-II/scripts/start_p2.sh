#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /home/perpetuite/perpetuite-III/simulator/P-II || exit 1
echo "=== $(date) : démarrage ===" >> /home/perpetuite/p2.log

export SKIP_ACE=1

npm run start 2>&1 | tee -a /home/perpetuite/p2.log

code=${PIPESTATUS[0]}

SD=/mnt/c/Windows/System32/shutdown.exe
LOG=/home/perpetuite/p2.log
BOOTS=/home/perpetuite/reboots.log

if [ "$code" = "42" ]; then
	echo "=== $(date) : arrêt d'urgence, extinction de Windows ===" >> /home/perpetuite/p2.log
	/mnt/c/Windows/System32/shutdown.exe /s /f /t 0
fi

case "$code" in
	42)                                   # arrêt d'urgence : extinction
		echo "=== $(date) : E-STOP (42), extinction ===" >> "$LOG"
		"$SD" /s /f /t 60
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