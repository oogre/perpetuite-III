#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   ogre
# @Last Modified time: 2022-08-10 15:21:14

./node_modules/.bin/babel --verbose --out-dir release src
chmod +x ./release/index.js