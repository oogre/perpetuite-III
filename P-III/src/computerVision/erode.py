#!/usr/bin/env python3

# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-10-13 01:02:34
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-10-13 12:20:35

import cv2
import numpy
import json
import sys
import os
from Pill import Pill

dataPath=os.environ['PIII_PATH']+"/data/"

cvImg = cv2.imread(dataPath+'camera.jpg')
# imLab = cv2.cvtColor(cvImg, cv2.COLOR_BGR2LAB)
gray = cv2.cvtColor(cvImg, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray,(21, 21),0)
_, mask = cv2.threshold(blur,48,255,cv2.THRESH_BINARY)

cv2.imwrite(dataPath+'mask2.jpg', mask)

mask = cv2.erode(mask,numpy.ones((20, 20),numpy.uint8),iterations = 1)
cv2.imwrite(dataPath+'mask2.eroded.jpg', mask)

mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (10,10)), iterations=4)
cv2.imwrite(dataPath+'mask2.eroded.morphed.jpg', mask)


mask = cv2.GaussianBlur(mask,(31, 31),0)
cv2.imwrite(dataPath+'mask2.eroded.morphed.blured.jpg', mask)

_, mask = cv2.threshold(mask,68,255,cv2.THRESH_BINARY)
cv2.imwrite(dataPath+'mask2.eroded.morphed.blured.masked.jpg', mask)
