#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2022-08-19 18:07:45
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-09-08 12:02:32


#echo 'export PIII_PATH='$(pwd) >> ~/.zshrc
touch ~/.zshenv
echo 'export PIII_PATH='$(pwd) >> ~/.zshenv
source ~/.zshenv

if [ $EUID != 0 ]; then
	sudo "$0" "$@"
	exit $?
fi

$(pwd)/scripts/uninstall.sh

echo "create symLink /usr/local/bin/P-III.core.api"
ln -s $(pwd)/release/robot/coreAPI/P-III.core.api /usr/local/bin/P-III.core.api

echo "create symLink /usr/local/bin/P-III.zProbe"
ln -s $(pwd)/release/robot/highLevelAPI/P-III.zProbe /usr/local/bin/P-III.zProbe

echo "create symLink /usr/local/bin/P-III.getZforXY"
ln -s $(pwd)/release/robot/highLevelAPI/P-III.getZforXY /usr/local/bin/P-III.getZforXY

echo "create symLink /usr/local/bin/P-III.goHome"
ln -s $(pwd)/release/robot/highLevelAPI/P-III.goHome /usr/local/bin/P-III.goHome

echo "create symLink /usr/local/bin/P-III.go"
ln -s $(pwd)/release/robot/highLevelAPI/P-III.go /usr/local/bin/P-III.go

echo "create symLink /usr/local/bin/P-III.grab"
ln -s $(pwd)/release/robot/highLevelAPI/P-III.grab /usr/local/bin/P-III.grab

echo "create symLink /usr/local/bin/P-III.cv.raw"
ln -s $(pwd)/release/computerVision/P-III.cv.raw /usr/local/bin/P-III.cv.raw

echo "create symLink /usr/local/bin/P-III.cv"
ln -s $(pwd)/release/computerVision/P-III.cv /usr/local/bin/P-III.cv

echo "create symLink /usr/local/bin/P-III.cv.wrapper"
ln -s $(pwd)/release/computerVision/P-III.cv.wrapper /usr/local/bin/P-III.cv.wrapper

echo "create symLink /usr/local/bin/P-III"
ln -s $(pwd)/release/App/P-III /usr/local/bin/P-III

