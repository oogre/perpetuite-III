#!/usr/bin/env bash

if pgrep -f "P-II.camera"; then
	echo "P-II.camera is already started"
else
	python.exe $(wslpath -w ./cv/camera_server.py) --host 0.0.0.0
fi
