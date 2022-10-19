#!/usr/bin/env python3 -u

# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-10-17 21:44:38
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-10-18 19:53:29


import sys
import threading
from setproctitle import setproctitle

setproctitle("P-III.liveCV.test")

last_line = ''
new_line_event = threading.Event()


def keep_last_line():
    global last_line, new_line_event
    for line in sys.stdin:
        last_line = line
        new_line_event.set()

keep_last_line_thread = threading.Thread(target=keep_last_line)
keep_last_line_thread.daemon = True
keep_last_line_thread.start()
flag = True
while(flag):
	if( "close" in last_line):
		print("close")	
		flag=False
	if( "diff" in last_line):
		print("difference")	
	elif(last_line):
		print(last_line)
	last_line=''
		
print("Finished")
quit()
