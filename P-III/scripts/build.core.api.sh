#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-08-22 19:46:37

./node_modules/.bin/babel --verbose --out-dir ./release/robot/coreAPI ./src/robot/coreAPI
./node_modules/.bin/babel --verbose --out-dir ./release/common ./src/common

cp -R ./src/config/ ./release/config/

rm ./release/robot/coreAPI/P-III.core.api
ln -s ./index.js ./release/robot/coreAPI/P-III.core.api 
chmod +x ./release/robot/coreAPI/index.js