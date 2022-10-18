#!/usr/bin/env python3 -u

# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-10-17 21:44:38
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-10-18 00:14:27


import sys
import threading

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
		flag=False
	elif(last_line):
		print(last_line)
		last_line=''
		
print("Finished")
quit()

# import sys
# try:
#     import thread
# except ImportError:
#     import _thread as thread
# from threading import Timer

# sys.stdout.reconfigure(encoding='utf-8')
# sys.stdin.reconfigure(encoding='utf-8')


# def run_with_timeout(timeout, kill, default, f, *args, **kwargs):
#     if not timeout:
#         return f(*args, **kwargs)
#     try:
#         timeout_timer = Timer(timeout, thread.interrupt_main)
#         timeout_timer.start()
#         result = f(*args, **kwargs).strip()
#         return result
#     except KeyboardInterrupt:
#         return kill
#     finally:
#         timeout_timer.cancel()

# while(True):
#     line = run_with_timeout(1, None, False, sys.stdin.readline)
#     if line is None:
#         break
#     elif line is False:
#         print(".")
#     else:
#         print(line)


# async def readStdin(timeout=None):
# 	try:
# 		return await asyncio.wait_for(sys.stdin.readline(), timeout)
# 	except asyncio.TimeoutError:
# 		print("fail");
# 		return False


# async def main():
# 	while(True):
# 		try :
# 			await asyncio.wait_for(fetch_data(), 5)
# 		except asyncio.TimeoutError:
# 			print(à)

# async def fetch_data():
#     await asyncio.sleep(100000)
#     raise Exception('No data')

# asyncio.run(main())


# lines = sys.stdin.readlines()
# print(lines)

# poll_obj = select.poll()
# poll_obj.register(sys.stdin, select.POLLIN)
# while(true):
#     poll_result = poll_obj.poll(0)
#     if poll_result:
#         line = sys.stdin.readline()
#         print(line)



# while True :
# 	line = sys.stdin.readline()
# 	print(line)
	# if len(i) > 0 :
	# 	res = sys.stdin.readline().strip()
	# 	sys.stdout.write(res)


# def read_stdin():
#     readline = sys.stdin.readline()
#     while readline:
#         yield readline
#         readline = sys.stdin.readline()

# for line in read_stdin():
#     line = line.split()
#     print(line)