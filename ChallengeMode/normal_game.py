import time
import pygame

import end
from ball import BallHandle
from collision import Collision
from enemy import EnemyHandle
from drag import Drag
from normal_hand import Hand
from normal_hand_tracking import HandTracking
import cv2
from scroll_bar import ScrollBar
from normal_settings import *
from normal_process_line import *
from cart import Cart
from cart import  CartHandle
class Game:
    def __init__(self, surface, ball_handle, enemy_handle, scroll_bar):
        self.which_card = None
        self.frame = None
        self.is_draw = False
        self.gestures = []
        self.game_start_time = time.time()
        self.score = 0
        self.hand = Hand()
        self.hand_tracking = HandTracking()
        self.surface = surface
        self.scroll_bar = scroll_bar
        self.enemy_handle = enemy_handle
        self.ball_handle = ball_handle
        self.process_line = npl(surface)
        self.carts_handle = CartHandle(surface)
        self.carts_handle.reset()
        # Load camera
        self.cap = cv2.VideoCapture(0)
        self.drag = Drag()

        self.collision=Collision()
        self.score = 0  

    def reset(self):  # reset all the needed variables
        self.hand_tracking = HandTracking()
        self.gestures = []
        self.score = 0
        self.game_start_time = time.time()
        self.ball_handle.reset()
        self.enemy_handle.reset()  
        self.scroll_bar.reset()
        self.carts_handle.reset()
        self.surface.fill((255, 255, 255))
        self.process_line.reset()

    def draw_score(self):
        font = pygame.font.SysFont(None, 36)  
        score_text = font.render(f'Score: {self.score}', True, (0, 0, 0))  
        self.surface.blit(score_text, (self.surface.get_width() - score_text.get_width() - 10,
                                       self.surface.get_height() - score_text.get_height() - 10))  
    def load_camera(self):
        _, self.frame = self.cap.read()

    def set_hand_position(self):
        self.frame = self.hand_tracking.scan_hands(self.frame)
        (x, y) = self.hand_tracking.get_hand_center()
        self.hand.rect.center = (x, y)

    def draw(self):

        self.hand.draw(self.surface)
        

    def update(self, ball_handle, surface, lane, enemy_handle, scroll_bar):

        self.load_camera()
        self.set_hand_position()
        (x, y) = self.hand_tracking.get_hand_center()
        self.hand.rect.center = (x, y)
        self.hand.left_click = (
                self.hand_tracking.love is True or self.hand_tracking.six is True or self.hand_tracking.two_fingers_up
                is True or self.hand_tracking.finger_up is True)

 
        self.which_card, self.is_draw = self.drag.update(self.hand, ball_handle, surface, lane,
                                                         self.hand_tracking, scroll_bar)
        ball_handle.update(surface)
        for ball in ball_handle.ball_list:
            self.collision.collide_with_element(ball,enemy_handle.enemy_list, self)
        scroll_bar.update(surface, enemy_handle, ball_handle)
        count = enemy_handle.update(surface)
        if count == -2:
            end.show_victory_screen(surface, self, self.score)
        elif count == -1:
            end.show_defeat_screen(surface, self, self.score)
        else:
            self.score = self.score + 20 * count
        self.carts_handle.update()
        for cart in self.carts_handle.cart_list:
            self.collision.collide_with_cart(cart, enemy_handle.enemy_list)

        self.draw()

        if self.hand.left_click:
            self.hand.image = self.hand.image_smaller.copy()
        else:
            self.hand.image = self.hand.orig_image.copy()
        self.process_line.update((enemy_handle.enemy_number_total - enemy_handle.enemy_total) / enemy_handle.enemy_number_total)
        cv2.imshow("Frame", self.frame)
        cv2.waitKey(1)
