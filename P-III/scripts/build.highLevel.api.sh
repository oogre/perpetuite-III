#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-09-28 11:25:28

npx babel --verbose --out-dir ./release/robot/highLevelAPI ./src/robot/highLevelAPI
npx babel --verbose --out-dir ./release/computerVision ./src/computerVision
npx babel --verbose --out-dir ./release/common ./src/common
npx babel --verbose --out-dir ./release/test ./src/test

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

echo "create symLink ./release/robot/highLevelAPI/P-III.goArc"
ln -s ./goArc.js ./release/robot/highLevelAPI/P-III.goArc
chmod +x ./release/robot/highLevelAPI/goArc.js

echo "create symLink ./release/robot/highLevelAPI/P-III.grab"
ln -s ./grab.js ./release/robot/highLevelAPI/P-III.grab
chmod +x ./release/robot/highLevelAPI/grab.js

echo "create symLink ./release/robot/highLevelAPI/P-III.xyDrift"
ln -s ./xyDrift.js ./release/robot/highLevelAPI/P-III.xyDrift
chmod +x ./release/robot/highLevelAPI/xyDrift.js

echo "create symLink ./release/robot/highLevelAPI/P-III.test"
ln -s ./test.js ./release/robot/highLevelAPI/P-III.test
chmod +x ./release/robot/highLevelAPI/test.js

cp -r ./src/computerVision/gxipy ./release/computerVision 
cp -r ./src/computerVision/*.py ./release/computerVision 

echo "create symLink ./release/computerVision/P-III.cv"
ln -s ./index.js ./release/computerVision/P-III.cv
chmod +x ./release/computerVision/index.js