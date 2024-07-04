import pygame
import image
from settings import CARD_SIZES
from hand import Hand
from hand_tracking import HandTracking
from ball import Ball


class Card(pygame.sprite.Sprite):
    def __init__(self, card_type):
        super().__init__()
        # load imgs
        self.card_fire = image.load("Assets/scroll_bar/card_fire.png", size=CARD_SIZES)
        self.card_golden = image.load("Assets/scroll_bar/card_golden.png", size=CARD_SIZES)
        self.card_ice = image.load("Assets/scroll_bar/card_ice.png", size=CARD_SIZES)
        self.card_ground = image.load("Assets/scroll_bar/card_ground.png", size=CARD_SIZES)
        # card elements
        self.type = card_type
        self.hand_tracking = HandTracking()
        self.hand = Hand()

        if self.type == "card_ice":
            self.image = self.card_ice
            self.card_rect = self.image.get_rect(topleft=(1200, 20))
            self.gestureStatus = self.hand_tracking.love
        if self.type == "card_fire":
            self.image = self.card_fire
            self.card_rect = self.image.get_rect(topleft=(1200, 20))
            self.gestureStatus = self.hand_tracking.two_fingers_up
        if self.type == "card_golden":
            self.image = self.card_golden
            self.card_rect = self.image.get_rect(topleft=(1200, 20))
            self.gestureStatus = self.hand_tracking.six
        if self.type == "card_ground":
            self.image = self.card_ground
            self.card_rect = self.image.get_rect(topleft=(1200, 20))
            self.gestureStatus = self.hand_tracking.finger_up
        # card velocity
        # FIXME temporarily 10, originally 2
        self.card_speed = 10
        self.rect = self.card_rect
        # card moving or not
        self.moving = True
        # card released or not
        self.released = False
        self.effected_by_card_ground = True

        self.selected = True
        self.move = False
        self.ball = Ball(self.type)
        self.has_used = False
        self.is_drag = False

    def update(self, scroll_rect, surface, enemy_handle):

        if not self.released:
            self.draw(surface, scroll_rect)
            if self.moving:
                self.card_rect.x -= self.card_speed
                if self.card_rect.x < scroll_rect.left:  
                    self.card_rect.x = scroll_rect.left  
                    self.moving = False
        else:
            enemy_handle.enemy_enchanted_handle(self)
    
            self.draw(surface, scroll_rect)

    def draw(self, surface, scroll_rect):
        if not self.released:
            if self.card_rect.right > scroll_rect.left + 10:  # Adjusted to not cover the scroll bar border
                visible_part = self.card_rect.clip(scroll_rect)
                visible_part_relative = visible_part.move(-self.card_rect.x, -self.card_rect.y)
                surface.blit(self.image, visible_part, area=visible_part_relative)
        surface.blit(self.image, (self.card_rect.x, self.card_rect.y))

    def get_card_type(self):
        return self.type

    def clear_image(self):
       
        self.kill()  
