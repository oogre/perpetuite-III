import math
import cv2
import numpy as np


PI_TIME_4 = 4 * math.pi

def getCircularity (A, P) :
    try :
        return PI_TIME_4 *A/(P*P)
    except :
        return 0

class Pill:
    def __init__(self, contour, imBGR):
        self.contour = contour
        M = cv2.moments(contour)
        self.area = M["m00"]
        self.perimeter = cv2.arcLength(contour, True)
        self.circularity = getCircularity(self.area, self.perimeter)
        if self.area > 4000 and self.area < 6000 and self.circularity > 0.75 :

            self.centroid = (M["m10"]/M["m00"], M["m01"]/M["m00"])

            x, y, w, h = cv2.boundingRect(contour)
            self.bBox = {"x":x, "y":y, "w":w, "h":h}

            parcel = imBGR[self.bBox["y"]:self.bBox["y"]+self.bBox["h"], self.bBox["x"]:self.bBox["x"]+self.bBox["w"]]
            pixels = np.float32(parcel.reshape(-1, 3))
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, .1)
            _, labels, palette = cv2.kmeans(pixels, 2, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
            _, counts = np.unique(labels, return_counts=True)
            [b, g, r] = palette[np.argmax(counts)]
            self.avgRGB = (int(b), int(g), int(r))
    def toObj(self):
        return {
            "center" : [self.centroid[0], self.centroid[1]],
            "avgRGB" : [self.avgRGB[2], self.avgRGB[1], self.avgRGB[0]],
            "box" : [self.bBox["x"],self.bBox["y"], self.bBox["w"], self.bBox["h"]]
        }
