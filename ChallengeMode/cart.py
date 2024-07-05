import random
import collision
import image
import time
from collision import *
from scroll_bar import ScrollBar
from normal_settings import *
from enemy import Enemy

class Cart(Enemy):
    def __init__(self, surface, row):
        super().__init__(surface)
        self.enemy_speed = 10
        self.enemy_animation_index = 0
        self.state = True
        self.direction = "right"
        self.collided = False

        self.enemy_frames = [image.load(f"NormalAssets/Cart/{el}.png", size=ENEMY_SIZES) for el in range(1, 10)]
        self.image = self.enemy_frames[self.enemy_animation_index]
        self.enemy_row = row
        self.rect = self.image.get_rect(topleft=CART_COORDINATE[self.enemy_row])

    def move_right(self):
        self.enemy_animation_index += 0.5
        if self.enemy_animation_index >= len(self.enemy_frames):
            self.enemy_animation_index = 0
        self.image = self.enemy_frames[int(self.enemy_animation_index)]
        self.rect.x += self.enemy_speed
    def update(self):
        if self.collided:
            self.move_right()
            #self.rect.x += self.enemy_speed



class CartHandle(pygame.sprite.Sprite):
    def __init__(self, surface):

        super().__init__()
        self.cart_list = pygame.sprite.Group()
        self.surface = surface
    def update(self):

        for cart in self.cart_list:

            cart.draw()
            cart.update()

    def reset(self):
        self.cart_list.empty()
        for i in range(0, 3):
            cart = Cart(self.surface, i)
            self.cart_list.add(cart)