#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /home/perpetuite/perpetuite-III/simulator/P-II || exit 1
echo "=== $(date) : démarrage ===" >> /home/perpetuite/p2.log
exec npm run start 2>&1 | tee -a /home/perpetuite/p2.log