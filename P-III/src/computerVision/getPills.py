#!/usr/bin/env python3

# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-10-13 12:51:21
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-10-13 12:59:38

#!/usr/bin/env python3

import cv2
import numpy
import json
import os
import SpoutSDK
from Pill import Pill

dataPath=os.environ['PIII_PATH']+"/data/"

# init spout receiver
receiverName = "PIII.livestream" 
spoutReceiverWidth = 2592
spoutReceiverHeight = 1944
# create spout receiver
spoutReceiver = SpoutSDK.SpoutReceiver()

# Its signature in c++ looks like this: bool pyCreateReceiver(const char* theName, unsigned int theWidth, unsigned int theHeight, bool bUseActive);
spoutReceiver.pyCreateReceiver(receiverName,spoutReceiverWidth,spoutReceiverHeight, False)

# create texture for spout receiver
textureReceiveID = glGenTextures(1)    

# initalise receiver texture
glBindTexture(GL_TEXTURE_2D, textureReceiveID)
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE)
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE)
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST)
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST)

# copy data into texture
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, spoutReceiverWidth, spoutReceiverHeight, 0, GL_RGBA, GL_UNSIGNED_BYTE, None ) 
glBindTexture(GL_TEXTURE_2D, 0)

# receive texture
# Its signature in c++ looks like this: bool pyReceiveTexture(const char* theName, unsigned int theWidth, unsigned int theHeight, GLuint TextureID, GLuint TextureTarget, bool bInvert, GLuint HostFBO);
spoutReceiver.pyReceiveTexture(receiverName, spoutReceiverWidth, spoutReceiverHeight, textureReceiveID, GL_TEXTURE_2D, False, 0)
glBindTexture(GL_TEXTURE_2D, textureReceiveID)
# copy pixel byte array from received texture       
cvImg = glGetTexImage(GL_TEXTURE_2D, 0, GL_RGB, GL_UNSIGNED_BYTE, outputType=None)  #Using GL_RGB can use GL_RGBA 
glBindTexture(GL_TEXTURE_2D, 0)
# swap width and height data around due to oddness with glGetTextImage. http://permalink.gmane.org/gmane.comp.python.opengl.user/2423
cvImg.shape = (cvImg.shape[1], cvImg.shape[0], cvImg.shape[2])


# imLab = cv2.cvtColor(cvImg, cv2.COLOR_BGR2LAB)
gray = cv2.cvtColor(cvImg, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray,(11, 11),0)
_, thresh1 = cv2.threshold(blur,48,255,cv2.THRESH_BINARY)

erosion = cv2.erode(thresh1,numpy.ones((20, 20),numpy.uint8),iterations = 1)
blur = cv2.GaussianBlur(erosion,(31, 31),0)
_, thresh2 = cv2.threshold(blur,68,255,cv2.THRESH_BINARY)
contours, _ = cv2.findContours(thresh2, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

# cv2.imwrite(dataPath+'camera.jpg', cvImg)
# cv2.imwrite(dataPath+'mask.jpg', thresh1)
# cv2.imwrite(dataPath+'mask.eroded.jpg', thresh2)
pills = []
for cnt in contours :
    pill = Pill(cnt, cvImg)
    if hasattr(pill, 'bBox'): 
        pills.append(pill.toObj())


print(json.dumps(pills))
# bridge = CvBridge()
# return GetCameraViewResponse(img=bridge.cv2_to_imgmsg(cvImg, "bgr8"), mask=bridge.cv2_to_imgmsg(thresh1, "mono8"), jsonPillsDesc=)

