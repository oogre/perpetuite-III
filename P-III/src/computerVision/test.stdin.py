#!/usr/bin/env python3 -u

# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-10-17 21:44:38
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-10-18 00:14:27

import sys
import select
sys.stdout.reconfigure(encoding='utf-8')
sys.stdin.reconfigure(encoding='utf-8')

while True :
	i, o, e  = select.select( [sys.stdin], [], [], 0.1)
	if len(i) > 0 :
		res = sys.stdin.readline().strip()
		sys.stdout.write(res)
