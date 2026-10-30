@echo off
title P-II.controller

set "DISTRO=Ubuntu-24.04"
set "SCRIPTS=/home/perpetuite/perpetuite-III/simulator/P-II/scripts"

rem chemin Windows (\\wsl.localhost\...) du script AutoHotkey, calculé par wslpath
for /f "delims=" %%i in ('wsl.exe -d %DISTRO% -u perpetuite wslpath -w %SCRIPTS%/P-II.controller.ontop.ahk') do set "ONTOP=%%i"

start "" "C:\Program Files\AutoHotkey\AutoHotkey.exe" "%ONTOP%"

wsl.exe -d %DISTRO% -u perpetuite -- %SCRIPTS%/start_p2.sh

REM timeout /t 30 /nobreak