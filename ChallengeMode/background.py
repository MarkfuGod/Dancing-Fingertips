
from settings import *
import pygame
import os
import image
import threading

SCREEN_WIDTH = 800  # Example screen width
SCREEN_HEIGHT = 600  # Example screen height

class Background:
    def __init__(self,path):
        self.images = [None] * 120  # Initialize a list to hold image surfaces
        self.current_frame = 0
        self.total_frames = 120
        self.image = None
        self.path = path
        self.load_initial_frame()
        self.load_images_async()

    def load_initial_frame(self):
        self.images[0] = pygame.image.load(os.path.join(self.path, "1.png"))
        self.image = self.images[0]

    def load_images_async(self):
        threading.Thread(target=self.load_images).start()

    def load_images(self):
        for i in range(1, self.total_frames):
            self.images[i] = pygame.image.load(os.path.join(self.path, f"{i+1}.png"))

    def update(self):
        self.current_frame = (pygame.time.get_ticks() // 100) % self.total_frames
        if self.images[self.current_frame]:
            self.image = self.images[self.current_frame]

    def draw(self, surface):
        self.update()
        image.draw(surface, self.image, (SCREEN_WIDTH//2, SCREEN_HEIGHT//2), pos_mode="center")