#!/usr/bin/env bash

if pgrep -f "P-II.simulator"; then
	echo "P-II.simulator is already started"
else
	./release/P-II
fi