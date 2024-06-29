import image
from ChallengeMode.settings import MEDAL_SIZES
from settings import *

class medal_ani:
    def __init__(self):
        self.medal_animation_speed = 0.5
        self.medal_animation_index = 0
        self.end_index = 5
        self.medal_frames_1 = [image.load(f"Assets/bronze_medal/{el}.png", size=MEDAL_SIZES) for el in range(1, 6)]
        self.medal_frames_2 = [image.load(f"Assets/silver_medal/{el}.png", size=MEDAL_SIZES) for el in range(1, 6)]
        self.medal_frames_3 = [image.load(f"Assets/gold_medal/{el}.png", size=MEDAL_SIZES) for el in range(1, 6)]
        self.medal_image = self.medal_frames_1[self.medal_animation_index]
        self.rect = self.medal_image.get_rect(topleft=MEDAL_POS)

    def play(self, goal):
        if self.medal_animation_index != self.end_index:
            if 60 <= goal < 80:
                self.medal_image = self.medal_frames_1[int(self.medal_animation_index)]
            elif 80 <= goal < 100:
                self.medal_image = self.medal_frames_2[int(self.medal_animation_index)]
            elif goal >= 100:
                self.medal_image = self.medal_frames_3[int(self.medal_animation_index)]
            self.medal_animation_index = self.medal_animation_speed + self.medal_animation_index

    def update(self, surface, goal):
        if goal >= 60:
            self.play(goal)
            surface.blit(self.medal_image, self.rect)


