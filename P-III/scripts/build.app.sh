#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-09-08 12:03:51

npx babel --verbose --out-dir ./release/App ./src/App

echo "remove symLink ./release/robot/highLevelAPI/P-III.*"
rm ./release/App/P-III*

echo "create symLink ./release/App/P-III"
ln -s ./index.js ./release/App/P-III
chmod +x ./release/App/index.js


mkdir -p ./release/Generator
cp -r ./src/Generator/*.py ./release/Generator/
echo "create symLink ./release/Generator/P-III.gen"
ln -s ./main.py ./release/Generator/P-III.gen
chmod +x ./release/Generator/main.py