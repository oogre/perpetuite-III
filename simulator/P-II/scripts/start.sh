#!/usr/bin/env bash

if pgrep -f "P-II.camera"; then
	echo "P-II.camera is already started"
else
	cd ./cv
	python server.py &
	cd ../
fi

if pgrep -f "P-II.simulator"; then
	echo "P-II.simulator is already started"
else
	./release/P-II
fi