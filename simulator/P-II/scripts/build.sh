#!/usr/bin/env bash
npx babel --verbose --out-dir ./release/ ./src/
chmod +x ./release/main.js
chmod +x ./release/player.js

rm -r ./release/P-II
ln -s ./main.js ./release/P-II

rm -r ./release/P-II.player
ln -s ./player.js ./release/P-II.player