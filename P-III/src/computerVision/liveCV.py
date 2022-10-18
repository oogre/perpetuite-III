#!/usr/bin/env python3 -u

# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-10-13 12:36:10
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-10-18 00:14:02

import cv2
import gxipy as gx
import numpy
import sys
import select
import json
import os
from Pill import Pill

# create a device manager
device_manager = gx.DeviceManager()

dev_num, dev_info_list = device_manager.update_device_list()
if dev_num == 0:
    print("Daheng camera is not found!!!")
    sys.exit(1)

# open the first device
cam = device_manager.open_device_by_index(1)

# exit when the camera is a mono camera
if cam.PixelColorFilter.is_implemented() is False:
    print("This sample does not support mono camera.")
    cam.close_device()
    sys.exit(1)

# set continuous acquisition
cam.TriggerMode.set(gx.GxSwitchEntry.OFF)

# set exposure gain and white balance to auto
cam.ExposureAuto.set(False)
cam.ExposureTime.set(15000.0)
cam.GainAuto.set(False)
cam.Gain.set(24.0)
# cam.LightSourcePreset.set(2)

# set the acq buffer count
cam.data_stream[0].set_acquisition_buffer_number(3)
# start data acquisition
cam.stream_on()

sys.stdout.reconfigure(encoding='utf-8')
sys.stdin.reconfigure(encoding='utf-8')

while True :
    raw_image = cam.data_stream[0].get_image()
    if raw_image is None:
        # print("Getting image failed.")
        continue

    # get RGB image from raw image
    rgb_image = raw_image.convert("RGB")
    if rgb_image is None:
        continue

    # create numpy array with data from raw image
    numpy_image = rgb_image.get_numpy_array()
    if numpy_image is None:
        continue

    # print("Getting image success.")
    #numpy image to opencv image
    img = cv2.cvtColor(numpy.asarray(numpy_image),cv2.COLOR_BGR2RGB)
    
    i, o, e  = select.select( [sys.stdin], [], [], 0.1)
    if len(i) > 0 :
        res = sys.stdin.readline().strip()
        
        # imLab = cv2.cvtColor(cvImg, cv2.COLOR_BGR2LAB)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray,(11, 11),0)
        _, thresh1 = cv2.threshold(blur,48,255,cv2.THRESH_BINARY)

        erosion = cv2.erode(thresh1,numpy.ones((20, 20),numpy.uint8),iterations = 1)
        blur = cv2.GaussianBlur(erosion,(31, 31),0)
        _, thresh2 = cv2.threshold(blur,68,255,cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh2, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        # cv2.imwrite(dataPath+'mask.jpg', thresh1)
        # cv2.imwrite(dataPath+'mask.eroded.jpg', thresh2)
        pills = []
        for cnt in contours :
            pill = Pill(cnt, cvImg)
            if hasattr(pill, 'bBox'): 
                pills.append(pill.toObj())
        print(json.dumps(pills))

        cv2.imwrite(dataPath+'camera.jpg', cvImg)
        cv2.imwrite(dataPath+'mask.eroded.jpg', thresh2)

# stop data acquisition
cam.stream_off()
# close device
cam.close_device()
