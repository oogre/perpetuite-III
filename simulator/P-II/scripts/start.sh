#!/usr/bin/env bash

# if pgrep -f "P-II.simulator"; then
# 	echo "P-II.simulator is already started"
# else
export SDL_VIDEODRIVER=x11
export SDL_AUDIODRIVER=dummy
exec ./release/P-II

# fi