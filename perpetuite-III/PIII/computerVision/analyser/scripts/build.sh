#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2022-04-07 17:50:17
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-04-07 23:34:56

./node_modules/.bin/babel --verbose --out-dir tmp src
mv tmp/* bin/ 
mv bin/index.js bin/pIII.cv
chmod 755 bin/pIII.cv
rm tmp/*
rm -r tmp