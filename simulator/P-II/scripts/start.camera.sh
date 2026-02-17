#!/usr/bin/env bash

if pgrep -f "P-II.camera"; then
	echo "P-II.camera is already started"
else
	cd ./cv
	screen -dm -S P-II.camera bash -c "python server.py"
	cd ../
fi
