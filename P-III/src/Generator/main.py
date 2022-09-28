#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-09-26 22:28:27
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-09-28 11:04:16

import cv2
import sys
import os.path
import os
import shutil
import numpy as np
from noise import pnoise3, pnoise2
from screeninfo import get_monitors

dataPath=os.environ['PIII_PATH']+"/data/"

width = 200
height = 200
colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]

def lerp (A, B, C) :
	return (C * A) + (1-C)*B

def curve(X) :
	X -= 0.5
	X = X
	return X

def genImage(w=75, h=75, offset=0) :
	image = np.zeros((w, h, 3), np.uint8) 
	m1 = curve(pnoise2(0.1, offset * 0.001))
	m2 = curve(pnoise2(0.2, offset * 0.002))
	m3 = curve(pnoise2(0.3, offset * 0.003))
	m4 = curve(pnoise2(0.4, offset * 0.004))
	for y in range(0, h):
		for x in range(0, w):
			r = x * 0.01
			s = y * 0.01
			c1 = pnoise3(0.0 + r*m1, 0.0 + s*m1, offset * 0.005);
			c2 = pnoise3(0.1 + r*m2, 0.1 + s*m2, offset * 0.006);
			c3 = pnoise3(0.2 + r*m3, 0.2 + s*m3, offset * 0.007);
			c4 = pnoise3(0.3 + r*m4, 0.3 + s*m4, offset * 0.008);
			c = max(c1,max(c2, max(c3, c4))); 
			if(c1 == c) :
				image[y, x] = (255, 0, 0);
			elif(c2 == c):
				image[y, x] = (0, 255, 0);
			elif(c3 == c):
				image[y, x] = (0, 0, 255);
			else:
				image[y, x] = (0, 0, 0);
	return image

def display(img, w=400, h=400, winname="generator") : 

	monitor, *_ =  get_monitors()

	dim = (w, h)
	x = int((monitor.width - w) * 0.5)
	y = int((monitor.height - h)* 0.5)
	resized = cv2.resize(img, dim, interpolation = cv2.INTER_AREA)
	cv2.namedWindow(winname)
	cv2.moveWindow(winname, x, y)
	cv2.setWindowProperty(winname, cv2.WND_PROP_TOPMOST, 1)
	cv2.imshow(winname, resized)
	k = cv2.waitKey(1)
	if k == 27:
	    cv2.destroyAllWindows()
	    return False
	return True

def diff(cur, old, w=400, h=400, ) : 
	diff = np.zeros((width, height, 4), np.uint8) 
	for y in range(0, height):
		for x in range(0, width):
			cR, cB, cG = cur[y, x]
			oR, oB, oG = old[y, x]
			if cR == oR and cG == oG and cB == oB :
				diff[y, x] = (255, 255, 255, 0)
			else :
				diff[y, x] = np.append(cur[y, x], 255)
	return diff

offset = 0

if len(sys.argv) > 1 and sys.argv[1] == "loop" :
	curImg = np.zeros((width, height, 3), np.uint8) 
	while (True):
		oldImg = curImg.copy()
		curImg = genImage(w=width, h=height, offset=offset)
		moveImg = diff(curImg, oldImg, w=width, h=height)
		offset += 5
		if not display(moveImg):
			break
else :
	try:
		offset = int(sys.argv[1])
	except :
		print("offset is forced to be 0 - pass any integer or 'loop'")
	curImg = genImage(w=width, h=height, offset=offset)
	oldImg = np.zeros((width, height, 3), np.uint8)
	if offset!=0 and os.path.isfile(dataPath+'draw.png') :
		shutil.move(dataPath+'draw.png', dataPath+'draw.old.png')
		oldImg = cv2.imread(dataPath+'draw.old.png')
	else :
		cv2.imwrite(dataPath+'draw.old.png', oldImg)
	cv2.imwrite(dataPath+'draw.png', curImg)
	moveImg = diff(curImg, oldImg, w=width, h=height)
	cv2.imwrite(dataPath+'draw.diff.png', moveImg)


