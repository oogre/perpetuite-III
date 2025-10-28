while !WinExist("ACE 3.8.3.250 - Interface Homme Machine")
	Sleep 100
Sleep 5000
WinActivate ; Use the window found by WinExist.
WinMove, 0, 0
MouseMove, 70, 370
Sleep 300
WinActivate ; Use the window found by WinExist.
Click
Sleep 7000
MouseMove, 35, 280
Sleep 300
WinActivate ; Use the window found by WinExist.
Click
Sleep 300
MouseMove, 160, 280
Sleep 300
WinActivate ; Use the window found by WinExist.
Click
Sleep 300
MouseMove, 350, 230
Sleep 300
WinActivate ; Use the window found by WinExist.
Click, Down
Sleep 100
WinActivate ; Use the window found by WinExist.
Click, Up
Sleep 300
MouseMove, 70, 370
Sleep 300
WinActivate ; Use the window found by WinExist.
Click
WinClose 
return