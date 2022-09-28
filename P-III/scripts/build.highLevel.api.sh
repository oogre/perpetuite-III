#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-09-08 12:03:51

npx babel --verbose --out-dir ./release/robot/highLevelAPI ./src/robot/highLevelAPI
npx babel --verbose --out-dir ./release/computerVision ./src/computerVision
npx babel --verbose --out-dir ./release/common ./src/common

echo "remove symLink ./release/robot/highLevelAPI/P-III.*"
rm ./release/robot/highLevelAPI/P-III.*

echo "remove symLink ./release/computerVision/P-III.*"
rm ./release/computerVision/P-III.*

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

echo "create symLink ./release/robot/highLevelAPI/P-III.grab"
ln -s ./grab.js ./release/robot/highLevelAPI/P-III.grab
chmod +x ./release/robot/highLevelAPI/grab.js

cp -r ./src/computerVision/gxipy ./release/computerVision 
cp -r ./src/computerVision/*.py ./release/computerVision 
cp -r ./src/computerVision/test.mjs ./release/computerVision/test.mjs

echo "create symLink ./release/computerVision/P-III.cv.raw"
ln -s ./computerVision.py ./release/computerVision/P-III.cv.raw
chmod +x ./release/computerVision/computerVision.py

echo "create symLink ./release/computerVision/P-III.cv"
ln -s ./index.js ./release/computerVision/P-III.cv
chmod +x ./release/computerVision/index.js

echo "create symLink ./release/computerVision/P-III.cv.wrapper"
ln -s ./test.mjs ./release/computerVision/P-III.cv.wrapper
chmod +x ./release/computerVision/test.mjs