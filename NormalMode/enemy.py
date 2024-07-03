import random

import collision
import image
from collision import *
from scroll_bar import ScrollBar
from settings import *




class Enemy(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.enemy_speed = 1
        self.enemy_animation_index = 0
        self.state = True
    
        self.enemy_frames = [image.load(f"Assets/Enemy/{el}.png", size=ENEMY_SIZES) for el in range(1, 7)]


        self.enemy_frames_reverse = [image.load(f"Assets/Enemy_Reverse/{el}.png", size=ENEMY_SIZES) for el in
                                     range(1, 7)]

        self.image = self.enemy_frames[self.enemy_animation_index]

        self.enemy_row = random.randint(0, 2)
        self.rect = self.image.get_rect(topleft=LANE_COORDINATE[self.enemy_row])
        self.direction = "left"

    
        self.collided = False

        self.enchanted = False

        self.enchanted_collided = False
        self.frozen = False  
        self.immune = False  
        self.affected_by_card_ground = True

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
        """
        更新敌人类
        :return:
        """
        if not self.frozen:
            self.cross_line()

            if self.state:
                if not self.enchanted:
                    self.enemy_move_left()
                else:
                    self.enemy_move_right()

    def draw(self, surface):

        surface.blit(self.image, self.rect)

    def remove_from_group(self):
        self.kill()  

    def unfreeze(self):
        self.frozen = False  


class EnemyHandle(pygame.sprite.Sprite):

    def __init__(self):
        super().__init__()
    
        self.enemy_number = 0

        self.enemy_appear_speed = 3000

        self.enemy_interval = random.randint(2000, self.enemy_appear_speed)

        self.last_appear_time = pygame.time.get_ticks()

        self.enemy_list = pygame.sprite.Group()
        self.scrollBar = ScrollBar()

        self.enemy_total = int((self.scrollBar.fire_num + self.scrollBar.golden_num / 2) * random.uniform(0.8, 0.9))
        self.collision = Collision()

    def enemy_enchanted_handle(self, ball):
        self.collision.collide_with_element(ball, self.enemy_list)

    def clear_enemy(self):
        self.enemy_list.empty()

    def remove_enemy(self, enemy):


        if not enemy.state:
            self.enemy_list.remove(enemy)

    def try_add_enemy(self):

        current_time = pygame.time.get_ticks()
        if self.enemy_total > 0 and current_time - self.last_appear_time >= self.enemy_interval:
            self.last_appear_time = current_time
            self.add_enemy(Enemy())

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
        for enemy in self.enemy_list:
            if enemy.cross_line():
                return -1
            self.remove_enemy(enemy)
        if self.enemy_total == 0 and len(self.enemy_list) == 0:
            return 1
        return 0
    def reset(self):
        self.enemy_list.empty()  
        self.enemy_total = int((self.scrollBar.fire_num + self.scrollBar.golden_num / 2) * random.uniform(0.8, 0.9))
        self.last_appear_time = pygame.time.get_ticks()  