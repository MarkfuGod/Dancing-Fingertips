import random

import collision
import image
import time
from collision import *
from scroll_bar import ScrollBar
from normal_settings import *



class Enemy(pygame.sprite.Sprite):
    def __init__(self, surface):
        super().__init__()
        self.enemy_speed = 1
        self.enemy_animation_index = 0
        self.state = True
    
        self.enemy_frames = [image.load(f"NormalAssets/Enemy/{el}.png", size=ENEMY_SIZES) for el in range(1, 7)]


        self.enemy_frames_reverse = [image.load(f"NormalAssets/Enemy_Reverse/{el}.png", size=ENEMY_SIZES) for el in
                                     range(1, 7)]

        self.image = self.enemy_frames[self.enemy_animation_index]

        self.enemy_row = random.randint(0, 2)
        self.rect = self.image.get_rect(topleft=LANE_COORDINATE[self.enemy_row])
        self.direction = "left"

    
        self.collided = False

        self.enchanted = False
        self.fired = False
        self.frozen_time = 0
        self.fired_time = 0
        self.enchanted_collided = False
        self.frozen = False  
        self.immune = False  
        self.affected_by_card_ground = True
        self.surface = surface
    def cross_line(self):

        if self.rect.x <= 100:
            self.state = False
            return True
        else:
            return False
    def enemy_move_left(self):

        self.enemy_animation_index += ANIMATION_SPEED
        if self.enemy_animation_index >= len(self.enemy_frames):
            self.enemy_animation_index = 0
        self.image = self.enemy_frames[int(self.enemy_animation_index)]
        self.rect.x -= self.enemy_speed

    def enemy_move_right(self):
        self.enemy_animation_index += ANIMATION_SPEED
        if self.enemy_animation_index >= len(self.enemy_frames_reverse):
            self.enemy_animation_index = 0
        self.image = self.enemy_frames_reverse[int(self.enemy_animation_index)]
        self.rect.x += self.enemy_speed

    def move_right(self):
        self.rect.x += 5

    def update(self):
        if self.rect.x > 1250:
            self.state = False
        if not self.frozen:
            self.cross_line()

            if self.state:
                if not self.enchanted:
                    self.enemy_move_left()
                else:
                    self.enemy_move_right()
        else:
            frozen_img = image.load(f"NormalAssets/Collision_SE/frozen.png", size=ENEMY_SIZES)
            self.surface.blit(frozen_img, self.rect)
            self.unfreeze()
        if self.fired:
            fired_imgs = [image.load(f"NormalAssets/Collision_SE/fire{i}.png", size=FIRE_SIZE)
                          for i in range(1,4)]
            fired_img = fired_imgs[(pygame.time.get_ticks() // 100) % 3]
            self.surface.blit(fired_img, (self.rect.x+23,self.rect.y))
            self.unfire()
        if self.enchanted:
            enchanted_img = image.load(f"NormalAssets/Collision_SE/dizzy.png", size=DIZZY_SIZE)
            self.surface.blit(enchanted_img, (self.rect.x + 13, self.rect.y-12))
    def draw(self):
        self.surface.blit(self.image, self.rect)

    def remove_from_group(self):
        #self.kill()  
        self.state = False

    def unfreeze(self):
        if time.time() - self.frozen_time > FROZEN_INTERVAL:
            self.frozen = False
    def unfire(self):
        if time.time() - self.fired_time > FIRE_INTERVAL:
            self.fired = False
            self.state = False

class EnemyHandle(pygame.sprite.Sprite):

    def __init__(self, surface):
        super().__init__()
    
        #self.enemy_number = 0

        self.enemy_appear_speed = 6000

        self.enemy_interval = random.randint(4000, self.enemy_appear_speed)

        self.last_appear_time = pygame.time.get_ticks()

        self.enemy_list = pygame.sprite.Group()
        self.scrollBar = ScrollBar()

        self.enemy_total = int((self.scrollBar.fire_num + self.scrollBar.golden_num / 2) * random.uniform(0.8, 0.9))
        self.collision = Collision()
        self.surface = surface
        self.enemy_number_total = self.enemy_total
    def enemy_enchanted_handle(self, ball):
        self.collision.collide_with_element(ball, self.enemy_list)

    def clear_enemy(self):
        self.enemy_list.empty()

    def remove_enemy(self, enemy):


        if not enemy.state:
            self.enemy_list.remove(enemy)
            return 1
        return 0
    def try_add_enemy(self):

        current_time = pygame.time.get_ticks()
        if self.enemy_total > 0 and current_time - self.last_appear_time >= self.enemy_interval:
            self.last_appear_time = current_time
            self.add_enemy(Enemy(surface=self.surface))

    def add_enemy(self, enemy):


        for enemy_item in self.enemy_list:
            if enemy_item.enemy_row == enemy.enemy_row:
                if enemy_item.rect.colliderect(enemy.rect):
                    enemy.rect.right = enemy_item.rect.right + 300
                    break
        self.enemy_total -= 1
        self.enemy_list.add(enemy)
        self.enemy_interval = random.randint(2000, self.enemy_appear_speed)

    def update(self, surface):

        self.try_add_enemy()
        self.enemy_list.update()

        self.enemy_list.draw(surface)
        collision.Collision.enemy_turned(self.collision, self.enemy_list)
        count = 0
        for enemy in self.enemy_list:
            if enemy.cross_line():
                return -1
            if self.remove_enemy(enemy) == 1:
                count = count + 1
        if self.enemy_total == 0 and len(self.enemy_list) == 0:
            return -2
        return count
    def reset(self):
        self.enemy_list.empty()  
        self.enemy_total = int((self.scrollBar.fire_num + self.scrollBar.golden_num / 2) * random.uniform(0.8, 0.9))
        self.last_appear_time = pygame.time.get_ticks()  