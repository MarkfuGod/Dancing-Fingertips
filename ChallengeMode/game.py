import pygame
import time
import random
from settings import *
from background import Background
from hand import Hand
from hand_tracking import HandTracking
from handgesture import Handgesture
from bomb import Bomb
from medal_animation import *
from record_plot import PlotRecord
from record_date import sys_date
import cv2
import ui

class Game:
    def __init__(self, surface):
        self.surface = surface
        self.background = Background("Assets/Background")
        self.medal_animation = medal_ani()
        self.date = sys_date().get_date()
        self.plot_record = PlotRecord()
        # Load camera
        self.cap = cv2.VideoCapture(0)

        self.sounds = {}
        self.sounds["slap"] = pygame.mixer.Sound(f"Assets/Sounds/slap.wav")
        self.sounds["slap"].set_volume(SOUNDS_VOLUME)
        self.sounds["screaming"] = pygame.mixer.Sound(f"Assets/Sounds/screaming.wav")
        self.sounds["screaming"].set_volume(SOUNDS_VOLUME)


    def reset(self): # reset all the needed variables
        self.hand_tracking = HandTracking()
        self.hand = Hand()
        self.gestures = []
        self.gestures_spawn_timer = 0
        self.score = 0
        self.game_start_time = time.time()


    def spawn_gestures(self):
        t = time.time()
        if t > self.gestures_spawn_timer:
            self.gestures_spawn_timer = t + HANDGESTURES_SPAWN_TIME

            # increase the probability that the gesture will be a bomb over time
            nb = (GAME_DURATION-self.time_left)/GAME_DURATION * 100  / 2  # increase from 0 to 50 during all  the game (linear)
            if random.randint(0, 100) < nb:
                self.gestures.append(Bomb())
            else:
                self.gestures.append(Handgesture())

            # spawn a other handgesture after the half of the game
            if self.time_left < GAME_DURATION/2:
                self.gestures.append(Handgesture())

    def load_camera(self):
        _, self.frame = self.cap.read()


    def set_hand_position(self):
        self.frame = self.hand_tracking.scan_hands(self.frame)
        (x, y) = self.hand_tracking.get_hand_center()
        self.hand.rect.center = (x, y)

    def draw(self):
        # draw the background
        self.background.draw(self.surface)
        # draw the gestures
        for gesture in self.gestures:
            gesture.draw(self.surface)
        # draw the hand
        self.hand.draw(self.surface)
        # draw the score
        ui.draw_text(self.surface, f"Score : {self.score}", (5, 5), COLORS["score"], font=FONTS["medium"],
                    shadow=True, shadow_color=(255,255,255))
        # draw the time left
        timer_text_color = (160, 40, 0) if self.time_left < 5 else COLORS["timer"] # change the text color if less than 5 s left
        ui.draw_text(self.surface, f"Time left : {self.time_left}", (SCREEN_WIDTH//2, 5),  timer_text_color, font=FONTS["medium"],
                    shadow=True, shadow_color=(255,255,255))


    def game_time_update(self):
        self.time_left = max(round(GAME_DURATION - (time.time() - self.game_start_time), 1), 0)



    def update(self):

        self.load_camera()
        self.set_hand_position()
        self.game_time_update()

        self.draw()

        if self.time_left > 0:
            self.spawn_gestures()
            (x, y) = self.hand_tracking.get_hand_center()
            self.hand.rect.center = (x, y)
            if(self.hand.not_click_flag):
                self.hand.left_click = (self.hand_tracking.hand_closed == True) and (self.hand.left_click == False)
                self.hand.player_gesture = self.hand_tracking.gesture_str
                self.hand.not_click_flag = False
            self.hand.not_click_flag = not self.hand_tracking.hand_closed
            print(f"Hand closed:{self.hand_tracking.hand_closed}",f"Gesture:{self.hand_tracking.gesture_str}")
            if self.hand.left_click:
                self.hand.image = self.hand.image_smaller.copy()
            else:
                self.hand.image = self.hand.orig_image.copy()
            self.score = self.hand.kill_gestures(self.gestures, self.score, self.sounds)
            for gesture in self.gestures:
                gesture.move()

        else: # when the game is over
            self.medal_animation.update(self.surface, self.score)
            ui.draw_text(self.surface, f"{self.score}", (MEDAL_ANIMATION_POS[0]+MEDAL_SIZE[0]//2,MEDAL_ANIMATION_POS[1]+MEDAL_SIZE[1]+30), 
                     COLORS[MEDAL], font=FONTS["medium"],
                     shadow=True, shadow_color=(255,255,255), pos_mode="center")
            if ui.button(self.surface, pos_y=540, text="Continue", click_sound=self.sounds["slap"]):
                self.plot_record.write_file(self.date, self.score)
                self.medal_animation.medal_animation_index = 0
                return "menu"


        cv2.imshow("Frame", self.frame)
        cv2.waitKey(1)
