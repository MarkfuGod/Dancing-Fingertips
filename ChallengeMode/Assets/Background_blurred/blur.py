import cv2
import numpy as np
import os

for file in os.listdir("original"):
    if file.endswith(".png"):
        path = os.path.join("original", file)
        img = cv2.imread(path)
        blur = cv2.GaussianBlur(img,(21,21),0)
        cv2.imwrite(file,blur)