@echo off
wsl.exe -d Ubuntu-24.4 -u perpetuite -- bash -lc "cd /home/perpetuite/perpetuite-III/simulator/P-II && npm run start >> /home/perpetuite/p2.log 2>&1"