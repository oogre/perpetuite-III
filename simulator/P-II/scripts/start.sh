#!/usr/bin/env bash

if pgrep -f "P-II.simulator"; then
	echo "P-II.simulator is already started"
else
	SDL_AUDIODRIVER=dummy ./release/P-II
fi