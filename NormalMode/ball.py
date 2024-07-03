import pygame

import image
from settings import BALL_SIZE


class Ball(pygame.sprite.Sprite):
    def __init__(self, card_type):

        super().__init__()

        self.card_move_speed = 5
        self.card_fire = image.load("Assets/ball/fire.png", size=BALL_SIZE)
        self.card_golden = image.load("Assets/ball/golden.png", size=BALL_SIZE)
        self.card_ice = image.load("Assets/ball/ice.png", size=BALL_SIZE)
        self.card_ground = image.load("Assets/ball/ground.png", size=BALL_SIZE)
        self.type = card_type  
        self.effected_by_card_ground = True
        if self.type == "card_ice":
            self.image = self.card_ice  
            self.rect = self.image.get_rect(topleft=(320, 240))  
        if self.type == "card_fire":
            self.image = self.card_fire  
            self.rect = self.image.get_rect(topleft=(320, 240))  
        if self.type == "card_golden":
            self.image = self.card_golden  
            self.rect = self.image.get_rect(topleft=(320, 240))  
        if self.type == "card_ground":
            self.image = self.card_ground  
            self.rect = self.image.get_rect(topleft=(320, 240))  

    def draw(self, surface):

        surface.blit(self.image, self.rect)


    def move_right(self):

        
        self.rect.x += 5
        print("------------------------------")
        print(str(self.card_move_speed))
        print("move" + str(self.rect.x))
        print("------------------------------")
        

    def get_card_type(self):

        return self.type

    def clear_image(self):

        self.kill()  

    def update(self):

        self.move_right()


class BallHandle(pygame.sprite.Sprite):
    def __init__(self):

        super().__init__()
        self.ball_list = pygame.sprite.Group()

    def update(self, surface):

        for ball in self.ball_list:
            ball.draw(surface)
            ball.update()

    def reset(self):
        self.ball_list.empty()
