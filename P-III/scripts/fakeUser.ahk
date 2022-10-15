while !WinExist("ACE 3.8.3.250 - Interface Homme Machine")
	Sleep 100
WinActivate ; Use the window found by WinExist.
WinMove, 0, 0
MouseMove, 70, 370
Sleep 300
Click
Sleep 7000
MouseMove, 35, 280
Sleep 300
Click
Sleep 300
MouseMove, 160, 280
Sleep 300
Click
Sleep 300
MouseMove, 350, 230
Sleep 300
Click, Down
Sleep 100
Click, Up
Sleep 300
MouseMove, 70, 370
Sleep 300
Click
WinClose 