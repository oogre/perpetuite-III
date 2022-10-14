#!/usr/bin/env python3

# -*- coding: utf-8 -*-
# @Author: Evrard Vincent
# @Date:   2022-10-13 12:36:10
# @Last Modified by:   vincent evrard
# @Last Modified time: 2022-10-13 12:48:51

import cv2
import gxipy as gx
import numpy
import sys
import SpoutSDK

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
    h, w = img.shape

    if 'spoutSender' not in globals():
    	globals spoutSender = SpoutSDK.SpoutSender()
    	spoutSender.CreateSender('PIII.livestream', w, h, 0)

    # create texture id for use with Spout
	senderTextureID = glGenTextures(1)

	# initalise our sender texture
	glBindTexture(GL_TEXTURE_2D, senderTextureID)
	glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE)
	glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE)
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST)
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST)
	glBindTexture(GL_TEXTURE_2D, 0)

	# Copy the frame from the webcam into the sender texture
	glBindTexture(GL_TEXTURE_2D, senderTextureID)
	glTexImage2D( GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, img )

	# Send texture to Spout
	# Its signature in C++ looks like this: bool SendTexture(GLuint TextureID, GLuint TextureTarget, unsigned int width, unsigned int height, bool bInvert=true, GLuint HostFBO = 0);
	spoutSender.SendTexture(senderTextureID, GL_TEXTURE_2D, w, h, False, 0)

    # unbind our sender texture
    glBindTexture(GL_TEXTURE_2D, 0)

# stop data acquisition
cam.stream_off()
# close device
cam.close_device()
