import pygame
import image
from settings import *

class Background:
    def __init__(self):
        self.images = []
        for i in range(1,121):
            self.images.append(image.load(f"Assets/background/{i}.png", 
                                size=(SCREEN_WIDTH, SCREEN_HEIGHT),
                                convert="default"))
        self.image = self.images[0]
        
      #   This requires tearing down the picture using Library like Pillow
      #   num_frames = image.get_num_frames()


    def draw(self, surface):
        self.image = self.images[int(pygame.time.get_ticks()//100)%120]
        image.draw(surface, self.image, (SCREEN_WIDTH//2, SCREEN_HEIGHT//2), pos_mode="center")
