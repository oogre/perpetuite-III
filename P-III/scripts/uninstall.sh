#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2022-08-22 19:44:20
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-08-22 19:45:01

if [ $EUID != 0 ]; then
	sudo "$0" "$@"
	exit $?
fi


rm /usr/local/bin/P-III*
