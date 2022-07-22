#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-07-22 11:32:02

./node_modules/.bin/babel --verbose --out-dir release src
chmod 777 ./release/index.js