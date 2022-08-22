#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-08-22 19:53:34

./node_modules/.bin/babel --verbose --out-dir ./release/robot/highLevelAPI ./src/robot/highLevelAPI
./node_modules/.bin/babel --verbose --out-dir ./release/common ./src/common

cp -R ./src/config/ ./release/config/

echo "remove symLink ./release/robot/highLevelAPI/P-III.*"
rm ./release/robot/highLevelAPI/P-III.*

echo "create symLink ./release/robot/highLevelAPI/P-III.zProbe"
ln -s ./zProbe.js ./release/robot/highLevelAPI/P-III.zProbe
chmod +x ./release/robot/highLevelAPI/zProbe.js

echo "create symLink ./release/robot/highLevelAPI/P-III.getZforXY"
ln -s ./getZforXY.js ./release/robot/highLevelAPI/P-III.getZforXY
chmod +x ./release/robot/highLevelAPI/getZforXY.js

echo "create symLink ./release/robot/highLevelAPI/P-III.goHome"
ln -s ./goHome.js ./release/robot/highLevelAPI/P-III.goHome
chmod +x ./release/robot/highLevelAPI/goHome.js

echo "create symLink ./release/robot/highLevelAPI/P-III.go"
ln -s ./go.js ./release/robot/highLevelAPI/P-III.go
chmod +x ./release/robot/highLevelAPI/go.js
