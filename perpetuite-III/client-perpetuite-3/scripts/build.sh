#!/bin/bash
# @Author: Evrard Vincent
# @Date:   2020-12-23 22:10:56
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-04-04 22:35:07


rollup -c

./node_modules/.bin/babel --verbose --out-dir release tmp



rm tmp/*
rm -r tmp