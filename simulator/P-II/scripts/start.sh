#!/usr/bin/env bash

cd "$(dirname "$0")/.." || exit 1          # racine de P-II, d'où qu'on soit lancé

export SDL_AUDIODRIVER=dummy

SIMULATION=$(grep -E '^SIMULATION' .env 2>/dev/null | cut -d= -f2 | tr -d ' \r"')

# ACE : démarre le serveur et charge le projet s'ils ne tournent pas déjà (SKIP_ACE=1 pour ignorer)
if [ "$SIMULATION" != "1" ]; then
	if ! npx --no-install zx ./scripts/initAce.mjs; then
		echo "initAce.mjs a échoué : P-II n'est pas lancé" >&2
		exit 1
	fi
fi

./release/P-II
