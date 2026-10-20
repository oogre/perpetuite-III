#!/usr/bin/env bash

if pgrep -f "P-II.camera"; then
	echo "P-II.camera is already started"
else
	python.exe $(wslpath -w ./simulator/P-II/cv/camera_server.py) --host 0.0.0.0
fi
