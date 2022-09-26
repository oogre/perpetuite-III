#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-08-30 13:28:30

npx babel --verbose --out-dir ./release/robot/coreAPI ./src/robot/coreAPI
npx babel --verbose --out-dir ./release/common ./src/common

rm ./release/robot/coreAPI/P-III.core.api
ln -s ./index.js ./release/robot/coreAPI/P-III.core.api 
chmod +x ./release/robot/coreAPI/index.js