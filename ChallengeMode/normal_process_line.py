import pygame

import image
from normal_settings import PROCESS_LINE_SIZE, PROCESS_LINE_POS, PROCESS_LINE_CONTENT_SIZE, \
    PROCESS_LINE_CONTENT_POS


class npl:
    def __init__(self, surface):
        self.surface = surface
        self.process = image.load("NormalAssets/process_line/pogress.png", size=PROCESS_LINE_SIZE)
        self.process_rect = self.process.get_rect(topleft=PROCESS_LINE_POS)
        self.rop = image.load("NormalAssets/process_line/rate_of_progress.png", size=PROCESS_LINE_CONTENT_SIZE)
        self.rop_rect = self.rop.get_rect(topleft=PROCESS_LINE_CONTENT_POS)
        self.rate = 1
        self.new_with = 480

    def reset(self):
        self.rate = 1
        self.new_with = 480

    def draw(self):
        self.surface.blit(self.process, self.process_rect)
        # PROCESS_LINE_CONTENT_SIZE = (480, 30)
        if self.rate <= 0:
            self.rate = 0
        self.new_width = 480 * self.rate
        resized_image = pygame.transform.scale(self.rop, (self.new_width, 30))
        # print(resized_image.get_width())
        self.surface.blit(resized_image, self.rop_rect)

    def update(self, rate):
        self.rate = rate
        self.draw()