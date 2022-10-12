#!/usr/bin/env python3

# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-10-13 01:02:34
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-10-13 01:27:57

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
blur = cv2.GaussianBlur(gray,(11, 11),0)
_, thresh1 = cv2.threshold(blur,48,255,cv2.THRESH_BINARY)



morph_kernel = numpy.ones((20, 20),numpy.uint8)
erosion = cv2.erode(thresh1,numpy.ones((20, 20),numpy.uint8),iterations = 1)

blur = cv2.GaussianBlur(erosion,(31, 31),0)
_, thresh2 = cv2.threshold(blur,68,255,cv2.THRESH_BINARY)

cv2.imwrite(dataPath+'mask2.jpg', thresh1)
cv2.imwrite(dataPath+'mask.erode.jpg', erosion)
cv2.imwrite(dataPath+'mask.erode.blur.jpg', blur)
cv2.imwrite(dataPath+'mask3.jpg', thresh2)
